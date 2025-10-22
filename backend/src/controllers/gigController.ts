
import { Request, Response } from 'express';
import Gig from '../models/Gig';

export const createGig = async (req: Request, res: Response) => {
  const { community, title, description } = req.body;

  try {
    const newGig = new Gig({
      user: req.user!.id,
      community,
      title,
      description,
    });

    const gig = await newGig.save();
    res.status(201).json(gig);
  } catch (err) {
    console.error((err as Error).message);
    res.status(500).send('Server error');
  }
};

export const getGigs = async (req: Request, res: Response) => {
  try {
    const gigs = await Gig.find().populate('user', ['name', 'email']).sort({ createdAt: -1 });
    res.json(gigs);
  } catch (err) {
    console.error((err as Error).message);
    res.status(500).send('Server error');
  }
};
