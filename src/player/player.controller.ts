import { Controller, Post } from '@nestjs/common';

@Controller('api/v1/player')
export class PlayerController {
  
  @Post()
  async savePlayer () {
    return JSON.stringify({
      "name": "Enzo"
    })
  }
}
