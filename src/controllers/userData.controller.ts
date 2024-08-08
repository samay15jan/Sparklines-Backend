import User from '../models/userSchema'
import { globalConstants } from '../constants'
import type { NextFunction, Request, Response } from 'express'

export class UpdateUserProfile {
  private async updateData(req: Request, res: Response, next: NextFunction, updateData: any, userId: String) {
    if (!updateData && !userId) {
      res.status(401).json({ status: globalConstants.status.failed, message: 'An error occured' })
      return undefined
    }
    try {
      const user = await User.findOneAndUpdate({ _id: userId }, updateData, { new: true })
      if (!user) {
        res.status(404).json({ status: globalConstants.status.failed, message: 'User does not exist' })
        return undefined
      }
      return user
    } catch (error) {
      next(error)
    }
  }

  public basicData = async (req: Request, res: Response, next: NextFunction) => {
    const { username, profilePic } = req.body
    const userId = req.body.userId
    const updateData = { username, profilePic }
    const response = await this.updateData(req, res, next, updateData, userId)
    if (response) {
      res.status(200).json({
        status: globalConstants.status.success,
        message: 'Successfully Changed',
        data: {
          username: response.username,
          profilePic: response.profilePic,
        },
      })
    }
  }

  public updateLanguages = async (req: Request, res: Response, next: NextFunction) => {
    const { languages, userId } = req.body
    const response = await this.updateData(req, res, next, { languages }, userId)
    if (response) {
      res.status(200).json({
        status: globalConstants.status.success,
        message: 'Successfully Changed',
        data: response.languages,
      })
    }
  }

  public updateFollowing = async (req: Request, res: Response, next: NextFunction) => {
    const { artistData, action } = req.body
    const userId = req.headers.userid
    const user = await User.findById(userId)
    if (!user) {
      res.status(404).json({ status: globalConstants.status.failed, message: 'User does not exist' })
      return undefined
    }
    if (action === 'add') {
      const isFollowing = user.following.some(item => 
        item.artistId === artistData.artistId
      );
      if (!isFollowing) {
        user.following.push(artistData)
      }
    } else if (action === 'remove') {
      user.following = user.following.filter((item) => item.artistId !== artistData.artistId)
    }
    await user.save()
    const response = user.following
    if (response) {
      res.status(200).json({
        status: globalConstants.status.success,
        message: 'Successfully Changed',
        data: response,
      })
    }
  }
}
