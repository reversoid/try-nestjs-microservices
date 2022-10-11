import {MongooseModuleAsyncOptions} from '@nestjs/mongoose';
import {ConfigService, ConfigModule} from '@nestjs/config';

export function getMongoConfig(): MongooseModuleAsyncOptions {
    return {
        useFactory: (configService: ConfigService) => ({
            uri: getMongoString(configService),
        }),
        inject: [ConfigService],
        imports: [ConfigModule],
    };
}

const getMongoString = (configService: ConfigService) => {
    // TODO CREATE USERS FOR LOGIN AND PASSWORD AUTH
    const login = configService.get('MONGO_LOGIN');
    const password = configService.get('MONGO_PASSWORD');

    const host = configService.get('MONGO_HOST');
    const port = configService.get('MONGO_PORT');
    const database = configService.get('MONGO_DATABASE');
    const auth = configService.get('MONGO_AUTHDATABASE');    
    
    return `mongodb://${host}:${port}/${database}?authSource=${auth}`;
}
