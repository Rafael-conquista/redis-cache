import { Router, Request, Response } from 'express';
import {
  cacheMiddleware, 
  clearCache, 
  saveToCache, 
  rateLimiter
} from './middleware/cacheMidleware'
import { getDB } from './database';
import { error } from 'console';

const router = Router();

router.get('/users', rateLimiter, cacheMiddleware, async (req:Request, res: Response) => {
  try {
    const db = getDB();
    const users = await db.all('SELECT * FROM users');

    await saveToCache('users_cache', users);
    
    console.log('pegou do banco')
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.get('/user/:id', async (req, res) => {
    const id  = req.params.id;
    const db = getDB()

    try{
        const user = await db.get('SELECT * FROM users WHERE id = ?', [id]);

        if (user){
            res.json(user);
        } else{
            res.status(404).json({error: "User not found"})
        }
    }catch(e){
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

router.post('/users', async (req, res):Promise<any> => {
    const { name } = req.body;
  
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
  
    const db = getDB();
  
    try {
      await db.run('INSERT INTO users (name) VALUES (?)', [name]);
      await clearCache('users_cache');
      console.log("cache deletado")
      res.status(201).json({ message: 'User added successfully' });
    } catch (error) {
      console.error('Error inserting user:', error);
      res.status(500).json({ error: 'Failed to insert user' });
    }
  });

export default router;
