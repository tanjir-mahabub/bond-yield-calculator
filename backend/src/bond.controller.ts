import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { BondService } from './bond.service';
import { BondInputDto } from './bond.dto';

/**
 * BondController — HTTP boundary only.
 *
 * No business logic here. If response shape changes (add pagination,
 * wrap in { data: ... }), only this file needs to change.
 * ValidationPipe runs globally via main.ts — not repeated here.
 */
@Controller('bond')
export class BondController {
  constructor(private readonly bondService: BondService) {}

  @Post('calculate')
  @HttpCode(HttpStatus.OK)
  calculate(@Body() dto: BondInputDto) {
    return this.bondService.calculate(dto);
  }
}
