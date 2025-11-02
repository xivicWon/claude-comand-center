import { Request, Response, NextFunction } from 'express';
import * as projectService from '../services/project.service';

export const createProject = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, description, directory, gitRepo, gitBranch } = req.body;
    const userId = (req as any).userId;

    if (!name || !directory) {
      return res.status(400).json({
        success: false,
        error: { message: 'Name and directory are required' },
      });
    }

    const project = await projectService.createProject({
      name,
      description,
      directory,
      gitRepo,
      gitBranch,
      ownerId: userId,
    });

    res.status(201).json({
      success: true,
      data: project,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Invalid directory')) {
      return res.status(400).json({
        success: false,
        error: { message: error.message },
      });
    }
    next(error);
  }
};

export const getProjects = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).userId;
    const projects = await projectService.getProjectsByOwner(userId);

    res.json({
      success: true,
      data: projects,
    });
  } catch (error) {
    next(error);
  }
};

export const getProjectById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const project = await projectService.getProjectById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        error: { message: 'Project not found' },
      });
    }

    res.json({
      success: true,
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProject = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { name, description, directory, gitRepo, gitBranch } = req.body;

    const project = await projectService.updateProject(id, {
      name,
      description,
      directory,
      gitRepo,
      gitBranch,
    });

    res.json({
      success: true,
      data: project,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Project not found') {
      return res.status(404).json({
        success: false,
        error: { message: error.message },
      });
    }
    if (error instanceof Error && error.message.includes('Invalid directory')) {
      return res.status(400).json({
        success: false,
        error: { message: error.message },
      });
    }
    next(error);
  }
};

export const deleteProject = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    await projectService.deleteProject(id);

    res.json({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const rescanProject = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const project = await projectService.rescanProject(id);

    res.json({
      success: true,
      data: project,
      message: 'Project rescanned successfully',
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Project not found') {
      return res.status(404).json({
        success: false,
        error: { message: error.message },
      });
    }
    next(error);
  }
};

export const validateDirectory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { directory } = req.body;

    if (!directory) {
      return res.status(400).json({
        success: false,
        error: { message: 'Directory path is required' },
      });
    }

    const isValid = await projectService.validateDirectory(directory);

    res.json({
      success: true,
      data: { valid: isValid },
    });
  } catch (error) {
    next(error);
  }
};
