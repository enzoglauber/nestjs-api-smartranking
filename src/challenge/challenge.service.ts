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

  async addChallenge(challenge: AddChallengeDto): Promise<Challenge> {
    /*
    Verificar se os jogadores informados estão cadastrados
    */

    const jogadores = await this.playerService.all()

    challenge.players.map((jogadorDto) => {
      const jogadorFilter = jogadores.filter((jogador) => jogador._id == jogadorDto._id)

      if (jogadorFilter.length == 0) {
        throw new BadRequestException(`O id ${jogadorDto._id} não é um jogador!`)
      }
    })

    /*
    Verificar se o solicitante é um dos jogadores da partida
    */

    const solicitanteEhJogadorDaPartida = await challenge.players.filter(
      (jogador) => jogador._id == challenge.solicitante
    )

    this.logger.log(`solicitanteEhJogadorDaPartida: ${solicitanteEhJogadorDaPartida}`)

    if (solicitanteEhJogadorDaPartida.length == 0) {
      throw new BadRequestException(`O solicitante deve ser um jogador da partida!`)
    }

    /*
    Descobrimos a categoria com base no ID do jogador solicitante
    */
    const categoriaDoJogador = await this.categoryService.consultarCategoriaDoJogador(
      challenge.requester
    )

    /*
    Para prosseguir o solicitante deve fazer parte de uma categoria
    */
    if (!categoriaDoJogador) {
      throw new BadRequestException(`O solicitante precisa estar registrado em uma categoria!`)
    }

    const desafioCriado = new this.challenge(AddChallengeDto)
    desafioCriado.category = categoriaDoJogador.category
    desafioCriado.request = new Date()
    /*
    Quando um desafio for criado, definimos o status desafio como pendente
    */
    desafioCriado.status = ChallengeStatus.PENDING
    this.logger.log(`desafioCriado: ${JSON.stringify(desafioCriado)}`)
    return await desafioCriado.save()
  }

  async consultarTodosDesafios(): Promise<Array<Challenge>> {
    return await this.challenge
      .find()
      .populate('solicitante')
      .populate('jogadores')
      .populate('partida')
      .exec()
  }

  async consultarDesafiosDeUmJogador(_id: any): Promise<Array<Challenge>> {
    const jogadores = await this.playerService.all()

    const jogadorFilter = jogadores.filter((jogador) => jogador._id == _id)

    if (jogadorFilter.length == 0) {
      throw new BadRequestException(`O id ${_id} não é um jogador!`)
    }

    return await this.challenge
      .find()
      .where('jogadores')
      .in(_id)
      .populate('solicitante')
      .populate('jogadores')
      .populate('partida')
      .exec()
  }

  async atualizarDesafio(_id: string, challenge: UpdateChallengeDto): Promise<void> {
    const desafioEncontrado = await this.challenge.findById(_id).exec()

    if (!desafioEncontrado) {
      throw new NotFoundException(`Desafio ${_id} não cadastrado!`)
    }

    /*
    Atualizaremos a data da resposta quando o status do desafio vier preenchido 
    */
    if (challenge.status) {
      desafioEncontrado.response = new Date()
    }
    desafioEncontrado.status = challenge.status
    desafioEncontrado.when = challenge.when

    await this.challenge.findOneAndUpdate({ _id }, { $set: desafioEncontrado }).exec()
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
      (jogador) => jogador._id == addChallengeToMatchDto.def
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
    desafioEncontrado.partida = resultado._id

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
