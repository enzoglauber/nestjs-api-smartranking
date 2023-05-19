import { Body, Controller, Post } from '@nestjs/common';
import { SavePlayerDto } from './dtos/save-player.dto';

@Controller('api/v1/player')
export class PlayerController {
  
  @Post()
  async savePlayer(
    @Body() {name, email}: SavePlayerDto
  ) {
    
    return JSON.stringify({
      "name": name,
      "email": email
    })
  }
}
