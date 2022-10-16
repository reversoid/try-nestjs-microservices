import { ConfigModule, ConfigService } from '@nestjs/config';
import {IRMQServiceAsyncOptions} from 'nestjs-rmq';

export const getRMQConfig = (): IRMQServiceAsyncOptions => ({
    inject: [ConfigService],
    imports: [ConfigModule],
    useFactory: (configSerivce: ConfigService) => ({
        exchangeName: configSerivce.get('AMQP_EXCHANGE') ?? '',
        connections: [
            {
                login: configSerivce.get('AMQP_USER') ?? '',
                password: configSerivce.get('AMQP_PASSWORD') ?? '',
                host: configSerivce.get('AMQP_HOSTNAME') ?? '',
            }
        ],
        queueName: configSerivce.get('AMQP_QUEUE'),
        prefetchCount: 32,
        serviceName: 'school-account',
    })
})