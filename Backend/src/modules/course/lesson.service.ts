import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { LessonDocument } from "./schemas/lesson.schema";
import { CreateLessonDto } from "./dto/create-lesson.dto";

@Injectable()
export class LessonService {
    constructor(
        @InjectModel('Lesson') private lessonModel: Model<LessonDocument>
    ) { }

    // Get all lessons
    async findAllLessons(): Promise<LessonDocument[]> {
        return await this.lessonModel.find().exec();
    }

    //get lesson by id
    async findLessonById(lessonId: string): Promise<LessonDocument> {
        const lesson= await this.lessonModel.findOne({ lessonId }).exec(); 
        if(!lesson){
            throw new NotFoundException('lesson not found');
        }
        return lesson;
    }

    async markLessonAsCompleted(lessonId: string, userId: string): Promise<{ message: string }> {
        const lesson = await this.lessonModel.findOne({ lessonId });
        
          if (!lesson) {
            throw new NotFoundException(`Lesson not found`);
          }
        
          // Check if the user already marked this lesson as finished
          const alreadyCompleted = lesson.completions.some(
            (completion) => completion?.userId?.toString() === userId
          );
        
          if (alreadyCompleted) {
            throw new Error('Lesson already marked as completed by this user');
          }
        
          // Add the user's completion record
          lesson.completions.push({
            userId,
            completedAt: new Date(),
          });
        
          await lesson.save();
          return { message: 'Lesson successfully marked as completed' };
        }

        
        
}