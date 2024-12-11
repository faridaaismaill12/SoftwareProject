import { IsEnum, IsArray, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class CreateChatDto {
  @IsString()
  @IsEnum(['private', 'group'])
  type!: 'private' | 'group';

  @IsArray()
  participants!: Types.ObjectId[];

  courseId!: Types.ObjectId;
}
