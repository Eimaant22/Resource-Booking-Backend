import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';

import Resource from '../models/Resource';
import User from '../models/User';
import AuditLog from '../models/AuditLog';

import AppError from '../utils/AppError';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../middleware/auth';


/**
 * POST /api/resources
 * Space Admin
 */
export const createResource = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId!.toString();

    const user = await User.findById(userId);

    if (!user) {
      throw new AppError(
        'User not found.',
        404,
        'USER_NOT_FOUND'
      );
    }

    const {
      name,
      type,
      building,
      location,
      capacity,
      amenities,
      photoUrl,
      requiresApproval,
      bufferTime,
      accessGroupId,
    } = req.body;

    if (!name || !type) {
      throw new AppError(
        'Name and type are required.',
        422,
        'VALIDATION_ERROR'
      );
    }

    const existing = await Resource.findOne({
      name: {
        $regex: new RegExp(`^${name.trim()}$`, 'i'),
      },
      organizationId: user.organizationId,
    });

    if (existing) {
      throw new AppError(
        'A resource with this name already exists.',
        409,
        'RESOURCE_EXISTS'
      );
    }

    const resource = await Resource.create({
      name: name.trim(),
      type,
      building,
      location,
      capacity,
      amenities,
      photoUrl,
      requiresApproval,
      bufferTime,
      accessGroupId,
      organizationId: user.organizationId,
      createdBy: user._id,
    });

    await AuditLog.create({
      userId: user._id,
      action: 'Create Resource',
      module: 'Resource',
      entityId: resource._id,
      description: `Created resource "${resource.name}"`,
      ipAddress: req.ip,
    });

    sendSuccess(
      res,
      {
        message: 'Resource created successfully.',
        resource,
      },
      201
    );
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/resources
 * Logged-in Users
 */
export const getResources = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId!.toString();

    const user = await User.findById(userId);

    if (!user) {
      throw new AppError(
        'User not found.',
        404,
        'USER_NOT_FOUND'
      );
    }

    const { search, type } = req.query;

    const filter: any = {
      organizationId: user.organizationId,
      isActive: true,
    };

    if (search) {
      filter.name = {
        $regex: search,
        $options: 'i',
      };
    }

    if (type) {
      filter.type = type;
    }

    const resources = await Resource.find(filter)
      .populate('createdBy', 'name email')
      .populate('accessGroupId', 'name')
      .sort({
        createdAt: -1,
      });

    sendSuccess(res, {
      resources,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/resources/:id
 * Logged-in Users
 */
export const getResourceById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id.toString();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError(
        'Invalid resource id.',
        400,
        'INVALID_ID'
      );
    }

    const resource = await Resource.findById(id)
      .populate('createdBy', 'name email')
      .populate('organizationId', 'name')
      .populate('accessGroupId', 'name');

    if (!resource) {
      throw new AppError(
        'Resource not found.',
        404,
        'RESOURCE_NOT_FOUND'
      );
    }

    sendSuccess(res, {
      resource,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/resources/:id
 * Space Admin
 */
export const updateResource = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id.toString();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError(
        'Invalid resource id.',
        400,
        'INVALID_ID'
      );
    }

    const userId = req.userId!.toString();

    const user = await User.findById(userId);

    if (!user) {
      throw new AppError(
        'User not found.',
        404,
        'USER_NOT_FOUND'
      );
    }

    const resource = await Resource.findById(id);

    if (!resource) {
      throw new AppError(
        'Resource not found.',
        404,
        'RESOURCE_NOT_FOUND'
      );
    }

    if (
      resource.organizationId.toString() !==
      user.organizationId?.toString()
    ) {
      throw new AppError(
        'You are not authorized to update this resource.',
        403,
        'FORBIDDEN'
      );
    }

    const {
      name,
      type,
      building,
      location,
      capacity,
      amenities,
      photoUrl,
      requiresApproval,
      bufferTime,
      accessGroupId,
    } = req.body;

    if (name !== undefined) resource.name = name;

    if (type !== undefined) resource.type = type;

    if (building !== undefined) resource.building = building;

    if (location !== undefined) resource.location = location;

    if (capacity !== undefined) resource.capacity = capacity;

    if (amenities !== undefined) resource.amenities = amenities;

    if (photoUrl !== undefined) resource.photoUrl = photoUrl;

    if (requiresApproval !== undefined)
      resource.requiresApproval = requiresApproval;

    if (bufferTime !== undefined)
      resource.bufferTime = bufferTime;

    if (accessGroupId !== undefined)
      resource.accessGroupId = accessGroupId;

    await resource.save();

    await AuditLog.create({
      userId: user._id,
      action: 'Update Resource',
      module: 'Resource',
      entityId: resource._id,
      description: `Updated resource "${resource.name}"`,
      ipAddress: req.ip,
    });

    sendSuccess(res, {
      message: 'Resource updated successfully.',
      resource,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/resources/:id/status
 * Space Admin
 */
export const updateResourceStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id.toString();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError(
        'Invalid resource id.',
        400,
        'INVALID_ID'
      );
    }

    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      throw new AppError(
        'isActive must be true or false.',
        422,
        'VALIDATION_ERROR'
      );
    }

    const userId = req.userId!.toString();

    const user = await User.findById(userId);

    if (!user) {
      throw new AppError(
        'User not found.',
        404,
        'USER_NOT_FOUND'
      );
    }

    const resource = await Resource.findById(id);

    if (!resource) {
      throw new AppError(
        'Resource not found.',
        404,
        'RESOURCE_NOT_FOUND'
      );
    }

    if (
      resource.organizationId.toString() !==
      user.organizationId?.toString()
    ) {
      throw new AppError(
        'You are not authorized to update this resource.',
        403,
        'FORBIDDEN'
      );
    }

    resource.isActive = isActive;

    await resource.save();

    await AuditLog.create({
      userId: user._id,
      action: isActive
        ? 'Activate Resource'
        : 'Deactivate Resource',
      module: 'Resource',
      entityId: resource._id,
      description: `${isActive ? 'Activated' : 'Deactivated'} resource "${resource.name}"`,
      ipAddress: req.ip,
    });

    sendSuccess(res, {
      message: 'Resource status updated successfully.',
      resource,
    });
  } catch (err) {
    next(err);
  }
};
/**
 * DELETE /api/resources/:id
 * Space Admin
 */
export const deleteResource = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id.toString();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError(
        'Invalid resource id.',
        400,
        'INVALID_ID'
      );
    }

    const userId = req.userId!.toString();

    const user = await User.findById(userId);

    if (!user) {
      throw new AppError(
        'User not found.',
        404,
        'USER_NOT_FOUND'
      );
    }

    const resource = await Resource.findById(id);

    if (!resource) {
      throw new AppError(
        'Resource not found.',
        404,
        'RESOURCE_NOT_FOUND'
      );
    }

    if (
      resource.organizationId.toString() !==
      user.organizationId?.toString()
    ) {
      throw new AppError(
        'You are not authorized to delete this resource.',
        403,
        'FORBIDDEN'
      );
    }

    resource.isActive = false;

    await resource.save();

    await AuditLog.create({
      userId: user._id,
      action: 'Delete Resource',
      module: 'Resource',
      entityId: resource._id,
      description: `Deleted resource "${resource.name}"`,
      ipAddress: req.ip,
    });

    sendSuccess(res, {
      message: 'Resource deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
};