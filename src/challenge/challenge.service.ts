import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { CategoryService } from 'src/category/category.service'
import { PlayerService } from 'src/player/player.service'
import { AddChallengeToMatchDto } from './dtos/add-challenge-to-match.dto'
import { AddChallengeDto } from './dtos/add-challenge.dto'
import { UpdateChallengeDto } from './dtos/update-challenge.dto'
import { ChallengeStatus } from './interfaces/challenge-status.enum'
import { Challenge, Match } from './interfaces/challenge.interface'

@Injectable()
export class ChallengeService {
  constructor(
    @InjectModel('Challenge') private readonly challenge: Model<Challenge>,
    @InjectModel('Match') private readonly match: Model<Match>,
    private readonly playerService: PlayerService,
    private readonly categoryService: CategoryService
  ) {}

  private readonly logger = new Logger(ChallengeService.name)

  async add(challengeDto: AddChallengeDto): Promise<Challenge> {
    /*
    Verificar se os jogadores informados estão cadastrados
    */

    const players = await this.playerService.all()

    challengeDto.players.map((challengePlayer) => {
      const filter = players.filter((player) => player._id == challengePlayer._id)

      if (filter.length == 0) {
        throw new BadRequestException(`The id ${challengePlayer._id} isn't a player!`)
      }
    })

    /*
    Verificar se o solicitante é um dos jogadores da partida
    */

    const isMatchRequester = challengeDto.players.filter(
      (player) => player._id == challengeDto.requester.toString()
    )

    this.logger.log(`isMatchRequester: ${isMatchRequester}`)

    if (isMatchRequester.length == 0) {
      throw new BadRequestException(`The resquester has to be a player in the match`)
    }

    /*
    Descobrimos a categoria com base no ID do jogador solicitante
    */
    const playerCategory = await this.categoryService.findByPlayer(challengeDto.requester)

    /*
    Para prosseguir o solicitante deve fazer parte de uma categoria
    */
    if (!playerCategory) {
      throw new BadRequestException(`The requester must be registered in a category!`)
    }

    const challenge = new this.challenge(challengeDto)
    challenge.category = playerCategory.name
    challenge.request = new Date()
    /*
    Quando um desafio for criado, definimos o status desafio como pendente
    */
    challenge.status = ChallengeStatus.PENDING
    this.logger.log(`challenge: ${JSON.stringify(challenge)}`)
    return await challenge.save()
  }

  async all(): Promise<Challenge[]> {
    return await this.challenge
      .find()
      .populate('requester')
      .populate('players')
      .populate('match')
      .exec()
  }

  async byIdPlayer(_id: string): Promise<Challenge[]> {
    const players = await this.playerService.all()
    const filter = players.filter((player) => player._id == _id)

    if (filter.length == 0) {
      throw new BadRequestException(`The ${_id} isn't a player!`)
    }

    return await this.challenge
      .find()
      .where('players')
      .in([_id])
      .populate('requester')
      .populate('players')
      .populate('match')
      .exec()
  }

  async update(_id: string, challengeDto: UpdateChallengeDto): Promise<void> {
    const challenge = await this.challenge.findById(_id).exec()

    if (!challenge) {
      throw new NotFoundException(`Desafio ${_id} não cadastrado!`)
    }

    /*
    Atualizaremos a data da resposta quando o status do desafio vier preenchido 
    */
    if (challengeDto.status) {
      challenge.response = new Date()
    }
    challenge.status = challengeDto.status
    challenge.when = challengeDto.when

    await this.challenge.findOneAndUpdate({ _id }, { $set: challenge }).exec()
  }

  async atribuirDesafioPartida(
    _id: string,
    addChallengeToMatchDto: AddChallengeToMatchDto
  ): Promise<void> {
    const desafioEncontrado = await this.challenge.findById(_id).exec()

    if (!desafioEncontrado) {
      throw new BadRequestException(`Desafio ${_id} não cadastrado!`)
    }

    /*
    Verificar se o jogador vencedor faz parte do desafio
    */
    const jogadorFilter = desafioEncontrado.players.filter(
      (jogador) => jogador._id == addChallengeToMatchDto.winner.toString()
    )

    this.logger.log(`desafioEncontrado: ${desafioEncontrado}`)
    this.logger.log(`jogadorFilter: ${jogadorFilter}`)

    if (jogadorFilter.length == 0) {
      throw new BadRequestException(`O jogador vencedor não faz parte do desafio!`)
    }

    /*
    Primeiro vamos criar e persistir o objeto partida
    */
    const partidaCriada = new this.match(AddChallengeToMatchDto)

    /*
    Atribuir ao objeto partida a categoria recuperada no desafio
    */
    partidaCriada.category = desafioEncontrado.category

    /*
    Atribuir ao objeto partida os jogadores que fizeram parte do desafio
    */
    partidaCriada.players = desafioEncontrado.players

    const resultado = await partidaCriada.save()

    /*
    Quando uma partida for registrada por um usuário, mudaremos o 
    status do desafio para realizado
    */
    desafioEncontrado.status = ChallengeStatus.DONE

    /*  
    Recuperamos o ID da partida e atribuimos ao desafio
    */
    desafioEncontrado.match = resultado._id

    try {
      await this.challenge.findOneAndUpdate({ _id }, { $set: desafioEncontrado }).exec()
    } catch (error) {
      /*
      Se a atualização do desafio falhar excluímos a partida 
      gravada anteriormente
      */
      await this.match.deleteOne({ _id: resultado._id }).exec()
      throw new InternalServerErrorException()
    }
  }

  async deletarDesafio(_id: string): Promise<void> {
    const desafioEncontrado = await this.challenge.findById(_id).exec()

    if (!desafioEncontrado) {
      throw new BadRequestException(`Desafio ${_id} não cadastrado!`)
    }

    /*
    Realizaremos a deleção lógica do desafio, modificando seu status para
    CANCELADO
    */
    desafioEncontrado.status = ChallengeStatus.CANCELED

    await this.challenge.findOneAndUpdate({ _id }, { $set: desafioEncontrado }).exec()
  }
}
