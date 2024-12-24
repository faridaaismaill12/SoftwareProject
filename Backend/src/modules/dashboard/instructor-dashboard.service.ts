import { Injectable } from '@nestjs/common';
import { InjectModel} from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { User } from '../user/schemas/user.schema';
import { Module, ModuleDocument } from '../course/schemas/module.schema';
import { Course } from '../course/schemas/course.schema';
import { Lesson, LessonDocument } from '../course/schemas/lesson.schema';
import { QuizResponse } from '../quizzes/schemas/response.schema';
import { Quiz} from '../quizzes/schemas/quiz.schema';

@Injectable()
export class InstructorDashboardService {
  constructor(
    @InjectModel(QuizResponse.name) private responseModel: Model<QuizResponse>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Module.name) private moduleModel: Model<Module>,
    @InjectModel(Course.name) private courseModel: Model<Course>,
    @InjectModel(Lesson.name) private lessonModel: Model<Lesson>,
    @InjectModel(Quiz.name) private quizModel: Model<Quiz>){}
  
    //Number of Enrolled Students per course
    async numberEnrolledStudents(courseId: string): Promise<number>{
      if (!Types.ObjectId.isValid(courseId)) {
        throw new BadRequestException('Invalid Course ID');
      }
      const course = await this.courseModel.findById(courseId);
      if (!course) {
        throw new NotFoundException('Course not found');
      }
      if(!course.enrolledStudents){
        return 0;
      }
      return course.enrolledStudents?.length;
    }

    //Average Completion Rate
  async getAverageLessonCompletionsPerDay(courseId: string): Promise<number> {
  if (!Types.ObjectId.isValid(courseId)) {
    throw new BadRequestException('Invalid Course ID');
  }

  const course = await this.courseModel.findById(courseId).populate('modules');
  if (!course) {
    throw new NotFoundException('Course not found');
  }

  if (!course.enrolledStudents || course.enrolledStudents.length === 0) {
    throw new NotFoundException('No students enrolled in this course');
  }

  const modules = course.modules.map((module) => module._id);
  let totalCompletions = 0;
  let uniqueCompletionDates = new Set<string>();
  

  // Iterate through modules
  for (const moduleId of modules) {
    const module = await this.moduleModel.findById(moduleId).populate('lessons');
    if (!module || !module.lessons || module.lessons.length === 0) {
      continue; // Skip if module or lessons are missing
    }

    // Iterate through lessons in the module
    for (const lesson of module.lessons) {
      const l = await this.lessonModel.findById(lesson);
      if (!l || !l.completions || l.completions.length === 0) {
        continue; // Skip if lesson or completions are missing
      }

      // Calculate completions for the lesson
      for (const completion of l.completions) {
        if (
          course.enrolledStudents.some((studentId) => studentId.toString() === completion.userId) &&
          completion.state === 'completed' 
        ) {
          totalCompletions++;
          uniqueCompletionDates.add(completion.completedAt.toISOString().split('T')[0]); // Track unique completion dates
        }
      }
    }
  }

  // Calculate the average
  const averageCompletions =
    uniqueCompletionDates.size > 0
      ? totalCompletions / uniqueCompletionDates.size
      : 0;

  return averageCompletions;
}



    //Average Quiz Grade by Course
    async averageCourseGrades(courseId: string): Promise<number> {
      if (!Types.ObjectId.isValid(courseId)) {
        throw new BadRequestException('Invalid Course ID');
      }
      const course = await this.courseModel.findById(courseId);
      if (!course) {
        throw new NotFoundException('Course not found');
      }
      const moduleIds = course.modules.map((module) => module._id);
      if (moduleIds.length === 0) {
        throw new NotFoundException('No modules found for this course');
      }
      const quizzes = await this.quizModel.find({ moduleId: { $in: moduleIds } });
      if (quizzes.length === 0) {
        throw new NotFoundException('No quizzes found for this course');
      }
      const quizIds = quizzes.map((quiz) => quiz._id);
      const responses = await this.responseModel.find({ quiz: { $in: quizIds } });
      if (responses.length === 0) {
        return 0;
      }
      const totalScore = responses.reduce((sum, response) => sum + response.score, 0);
      return totalScore / responses.length;
    }
    
    //Average Quiz Grade by Module 
    async averageModuleGrades(moduleId: string): Promise<number> {
      if (!Types.ObjectId.isValid(moduleId)) {
        throw new BadRequestException('Invalid Module ID');
      }
      const quizzes = await this.quizModel.find({ moduleId: new Types.ObjectId(moduleId) });
      if (quizzes.length === 0) {
        throw new NotFoundException('No quizzes found for this course');
      }
      const quizIds = quizzes.map((quiz) => quiz._id);
      const responses = await this.responseModel.find({ quiz: { $in: quizIds } });
      if (responses.length === 0) {
        return 0;
      }
      const totalScore = responses.reduce((sum, response) => sum + response.score, 0);
      return totalScore / responses.length;
    }

    //Average Course Rating
    async averageCourseRating(courseId: string): Promise<number>{
      if (!Types.ObjectId.isValid(courseId)) {
        throw new BadRequestException('Invalid Course ID');
      }
      const course = await this.courseModel.findById(courseId);
      if (!course) {
        throw new NotFoundException('Course not found');
      }
      if(!course.averageRating){
        return 0;
      }
      return course.averageRating;
    }

 }

