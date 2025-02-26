import { Request, Response, NextFunction } from 'express';
import redis from './redisClient';
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { Command } from 'ioredis';

export const cacheMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const cachedData = await redis.get('users_cache');

    if (cachedData) {
      console.log('utilizou o cache do redis');
      res.json(JSON.parse(cachedData));
      return;
    }
    console.log('utilizou a requisição do banco');
    next();
  } catch (error) {
    console.error('Erro ao acessar o cache:', error);
    next();
  }
};

export const saveToCache = async (key: string, data: any, expiry = 60) => {
  try {
    await redis.setex(key, expiry, JSON.stringify(data));
  } catch (error) {
    console.error('Erro ao salvar no cache:', error);
  }
};

export const clearCache = async (key: string) => {
  try {
    await redis.del(key);
  } catch (error) {
    console.error('Erro ao limpar cache:', error);
  }
};

export const rateLimiter = rateLimit({
    store: new RedisStore({
      sendCommand: async (...args: string[]): Promise<any> => {
        const command = new Command(args[0], args.slice(1), {
          replyEncoding: 'utf8',
        });
  
        try {
          const result = await redis.sendCommand(command);
          if (result === null || result === undefined) {
            throw new Error('Comando Redis retornou uma resposta inesperada.');
          }
          return result;
        } catch (error) {
          console.error('Erro ao executar sendCommand:', error);
          throw error;
        }
      },
    }),
    windowMs: 0.5 * 60 * 1000, // 30 segundos
    max: 2, // Limite de 2 requisições por IP para testar
    keyGenerator: (req: Request) => req.ip || 'unknown-ip',
    message: 'Muitas requisições feitas. Por favor, tente novamente mais tarde.',
    standardHeaders: true,
    legacyHeaders: false,
  });
