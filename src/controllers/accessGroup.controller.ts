import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';

import AccessGroup from '../models/AccessGroup';
import Organization from '../models/Organization';
import User from '../models/User';

import { AuthRequest } from '../middleware/auth';
import AppError from '../utils/AppError';
import { sendSuccess } from '../utils/response';
import Resource from '../models/Resource';

/**
 * POST /api/access-groups
 */
export const createAccessGroup = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId!.toString();

    const user = await User.findById(userId);

    if (!user) {
      throw new AppError('User not found.',404,'USER_NOT_FOUND');
    }

    if (!user.organizationId) {
      throw new AppError('Organization not assigned.',400,'NO_ORGANIZATION');
    }

    const { name, description } = req.body;

    if (!name) {
      throw new AppError('Name is required.',422,'VALIDATION_ERROR');
    }

    const exists = await AccessGroup.findOne({
      organizationId:user.organizationId,
      name
    });

    if(exists){
      throw new AppError(
        'Access group already exists.',
        409,
        'ACCESS_GROUP_EXISTS'
      );
    }

    const accessGroup = await AccessGroup.create({
      name,
      description,
      organizationId:user.organizationId
    });

    sendSuccess(res,{
      message:'Access group created successfully.',
      accessGroup
    },201);

  } catch(err){
    next(err);
  }
};

/**
 * GET /api/access-groups
 */
export const getAccessGroups = async(
  req:AuthRequest,
  res:Response,
  next:NextFunction
):Promise<void>=>{
  try{

    const user=await User.findById(req.userId!.toString());

    if(!user){
      throw new AppError('User not found.',404,'USER_NOT_FOUND');
    }

    const accessGroups=await AccessGroup.find({
      organizationId:user.organizationId
    })
    .populate('users','name email role')
    .sort({createdAt:-1});

    sendSuccess(res,{accessGroups});

  }catch(err){
    next(err);
  }
};

/**
 * GET /api/access-groups/:id
 */
export const getAccessGroupById=async(
req:AuthRequest,
res:Response,
next:NextFunction
):Promise<void>=>{

try{

const id=req.params.id.toString();

if(!mongoose.Types.ObjectId.isValid(id)){
throw new AppError(
'Invalid access group id.',
400,
'INVALID_ID'
);
}

const accessGroup=await AccessGroup.findById(id)
.populate('users','name email role department');

if(!accessGroup){
throw new AppError(
'Access group not found.',
404,
'ACCESS_GROUP_NOT_FOUND'
);
}

sendSuccess(res,{accessGroup});

}catch(err){
next(err);
}
};

/**
 * PATCH /api/access-groups/:id
 */
export const updateAccessGroup=async(
req:AuthRequest,
res:Response,
next:NextFunction
):Promise<void>=>{

try{

const id=req.params.id.toString();

if(!mongoose.Types.ObjectId.isValid(id)){
throw new AppError(
'Invalid access group id.',
400,
'INVALID_ID'
);
}

const accessGroup=await AccessGroup.findById(id);

if(!accessGroup){
throw new AppError(
'Access group not found.',
404,
'ACCESS_GROUP_NOT_FOUND'
);
}

const{name,description}=req.body;

if(name!==undefined){
accessGroup.name=name;
}

if(description!==undefined){
accessGroup.description=description;
}

await accessGroup.save();

sendSuccess(res,{
message:'Access group updated successfully.',
accessGroup
});

}catch(err){
next(err);
}
};

/**
 * PATCH /api/access-groups/:id/add-user
 */
export const addUserToGroup=async(
req:AuthRequest,
res:Response,
next:NextFunction
):Promise<void>=>{

try{

const groupId=req.params.id.toString();
const{userId}=req.body;

const accessGroup=await AccessGroup.findById(groupId);

if(!accessGroup){
throw new AppError(
'Access group not found.',
404,
'ACCESS_GROUP_NOT_FOUND'
);
}

const user=await User.findById(userId);

if(!user){
throw new AppError(
'User not found.',
404,
'USER_NOT_FOUND'
);
}

const exists=accessGroup.users.some(
id=>id.toString()===userId
);

if(!exists){
accessGroup.users.push(user._id);
await accessGroup.save();
}

sendSuccess(res,{
message:'User added successfully.',
accessGroup
});

}catch(err){
next(err);
}
};

/**
 * PATCH /api/access-groups/:id/remove-user
 */
export const removeUserFromGroup=async(
req:AuthRequest,
res:Response,
next:NextFunction
):Promise<void>=>{

try{

const groupId=req.params.id.toString();
const{userId}=req.body;

const accessGroup=await AccessGroup.findById(groupId);

if(!accessGroup){
throw new AppError(
'Access group not found.',
404,
'ACCESS_GROUP_NOT_FOUND'
);
}

accessGroup.users=accessGroup.users.filter(
id=>id.toString()!==userId
);

await accessGroup.save();

sendSuccess(res,{
message:'User removed successfully.',
accessGroup
});

}catch(err){
next(err);
}
};

/**
 * DELETE /api/access-groups/:id
 */
export const deleteAccessGroup = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id.toString();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError(
        'Invalid access group id.',
        400,
        'INVALID_ID'
      );
    }

    const accessGroup = await AccessGroup.findById(id);

    if (!accessGroup) {
      throw new AppError(
        'Access group not found.',
        404,
        'ACCESS_GROUP_NOT_FOUND'
      );
    }

    // Prevent deletion if resources are using this group
    const linkedResources = await Resource.countDocuments({
      accessGroupId: accessGroup._id,
    });

    if (linkedResources > 0) {
      throw new AppError(
        'Cannot delete access group because it is assigned to one or more resources.',
        400,
        'ACCESS_GROUP_IN_USE'
      );
    }

    await accessGroup.deleteOne();

    sendSuccess(res, {
      message: 'Access group deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
};