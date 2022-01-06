import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  addTransaction(@Body() createTransactionDto: CreateTransactionDto) {
    return this.transactionService.addTransaction(createTransactionDto);
  }

  @Get()
  getTransactions(@Query('clientId') clientId: string) {
    console.log('all', typeof clientId);
    return this.transactionService.getTransactions(parseInt(clientId));
  }
}
