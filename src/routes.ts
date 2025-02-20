import express, { Request, Response } from 'express';
import { getDB } from './database';
import { error } from 'console';

const router = express.Router();

router.get('/users', async (req, res) => {
  const db = getDB()
  const users = await db.all('SELECT * FROM users');
  res.json(users);
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
      res.status(201).json({ message: 'User added successfully' });
    } catch (error) {
      console.error('Error inserting user:', error);
      res.status(500).json({ error: 'Failed to insert user' });
    }
  });

export default router;
