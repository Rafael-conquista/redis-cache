import { Request, Response, NextFunction } from 'express';
import redis from './redisClient';

export const cacheMiddleware = async (req: Request, res: Response, next: NextFunction):Promise<void> => {
  try {
    const cachedData = await redis.get('users_cache');

    if (cachedData) {
        console.log('utilizou o cache do redis');
        res.json(JSON.parse(cachedData));
        return;
      }
    console.log('utilizou a requisição do banco')
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
