import { Module as Modules } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Quiz, QuizSchema } from './schemas/quiz.schema';
import { Question, QuestionSchema } from './schemas/question.schema';
import { QuizResponse, ResponseSchema } from './schemas/response.schema';
import { User, UserSchema } from '../user/schemas/user.schema';
import {Module, ModuleSchema} from '../course/schemas/module.schema'
import { InstructorQuizController } from './instructor-quizzes.controller';  // Make sure the path is correct
import { InstructorQuizzesService } from './instructor-quizzes.service';
import { StudentQuizzesController } from './student-quizzes.controller';
import { StudentQuizzesService } from './student-quizzes.service';
import { AdminQuizzesService } from './admin-quiz.service';
import { AdminQuizzesController } from './admin-quiz.controller';
import { JwtAuthGuard } from '../security/guards/jwt-auth.guard';
import { JwtModule } from '@nestjs/jwt';
import { Course, CourseSchema} from '../course/schemas/course.schema';
import { ConfigModule, ConfigService } from '@nestjs/config';


@Modules({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: '1d',
        },
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([{ name: Quiz.name, schema: QuizSchema }]),
    MongooseModule.forFeature([{ name: Question.name, schema: QuestionSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Module.name, schema: ModuleSchema }]),
    MongooseModule.forFeature([{ name: QuizResponse.name, schema: ResponseSchema}]),
    MongooseModule.forFeature([{ name: Course.name, schema: CourseSchema }]),
  ],
  controllers: [InstructorQuizController,StudentQuizzesController,AdminQuizzesController],  // Make sure the controller is correct
  providers: [InstructorQuizzesService,StudentQuizzesService,AdminQuizzesService],
})
export class QuizzesModule {}