import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Course, CourseDocument } from './schemas/course.schema';

@Injectable()
export class CourseService {
  constructor(
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
  ) {}

  // Create a course
  async createCourse(courseData: Partial<Course>): Promise<Course> {
    if (courseData.courseId) {
      // Check if courseId already exists
      const existingCourse = await this.courseModel.findOne({ courseId: courseData.courseId });
      if (existingCourse) {
        throw new BadRequestException('Course with ID ${courseData.courseId} already exists.');
      }
    }

    const newCourse = new this.courseModel(courseData);
    return newCourse.save();
  }

  // Get all courses
  async findAll(): Promise<Course[]> {
    return this.courseModel.find().exec();
  }

  // Get a specific course by MongoDB _id
  async findCourseById(courseId: string): Promise<Course> {
    if (!Types.ObjectId.isValid(courseId)) {
      throw new BadRequestException('Invalid course ID format.');
    }

    const course = await this.courseModel.findById(courseId);
    if (!course) {
      throw new NotFoundException('Course with ID ${courseId} not found');
    }

    return course;
  }

  // Create a module for a specific course using MongoDB _id
  // Create a module for a specific course using MongoDB _id
  async createModuleForCourse(
    courseId: string,
    moduleData: { title: string; content: string; difficultyLevel: 'high' | 'medium' | 'low' },
  ): Promise<any> {
    if (!Types.ObjectId.isValid(courseId)) {
      throw new BadRequestException('Invalid course ID format.');
    }
  
    // Find the course by _id
    const course = await this.courseModel.findById(courseId);
    if (!course) {
      throw new NotFoundException('Course with ID ${courseId} not found');
    }
  
    // Validate difficultyLevel
    if (!['high', 'medium', 'low'].includes(moduleData.difficultyLevel)) {
      throw new BadRequestException('Invalid difficultyLevel. Valid options are: high, medium, low.');
    }
  
    // Add the new module to the modules array
    const newModule = {
      title: moduleData.title,
      content: moduleData.content,
      difficultyLevel: moduleData.difficultyLevel, // Include difficultyLevel explicitly
      lessons: [], // Default empty lessons
    };
    course.modules.push(newModule);
    await course.save();
  
    // Return the newly created module
    return course.modules[course.modules.length - 1];
  }
  


  // Create a lesson for a specific module in a course using MongoDB _id
  async createLessonForModule(
    courseId: string,
    moduleId: string,
    lessonData: { title: string; content: string },
  ): Promise<any> {
    if (!Types.ObjectId.isValid(courseId) || !Types.ObjectId.isValid(moduleId)) {
      throw new BadRequestException('Invalid course or module ID format.');
    }
  
    // Find the course by _id
    const course = await this.courseModel.findById(courseId);
    if (!course) {
      throw new NotFoundException('Course with ID ${courseId} not found');
    }
  
    // Find the module within the course
    const module = course.modules.find((mod) => mod._id?.toString() === moduleId);
    if (!module) {
      throw new NotFoundException('Module with ID ${moduleId} not found.');
    }
  
    // Add the new lesson to the lessons array
    const newLesson = { ...lessonData }; // MongoDB will generate _id
    module.lessons.push(newLesson);
    await course.save();
  
    // Return the newly created lesson
    return module.lessons[module.lessons.length - 1];
  }
  
  
  // Update a course by MongoDB _id
  async updateCourse(courseId: string, updatedData: Partial<Course>): Promise<Course> {
    if ('modules' in updatedData) {
      throw new BadRequestException('Updating the modules attribute is not allowed.');
    }

    const updatedCourse = await this.courseModel
      .findByIdAndUpdate(
        courseId,
        { $set: updatedData }, // Update only the provided fields
        { new: true, runValidators: true }, // Return the updated document and run schema validation
      )
      .exec();

    if (!updatedCourse) {
      throw new NotFoundException('Course with ID ${courseId} not found');
    }

    return updatedCourse;
  }
}