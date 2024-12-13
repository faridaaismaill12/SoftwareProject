
import {
    Controller,
    HttpCode,
    Post,
    Body,
    Patch,
    Delete,
    Get,
    Param,
    BadRequestException,
    Query,
    UseGuards,
    Req,
    UnauthorizedException,
    ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { UserService } from './user.service';
import { ResetPasswordDto } from './dto/password-reset.dto';
import { CreateStudentDto } from './dto/create-student.dto';
import { SearchInstructorDto } from './dto/search-instructor.dto';
import { SearchStudentDto } from './dto/search-student.dto';
import { JwtAuthGuard } from '../security/guards/jwt-auth.guard';

@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) { }

    /**
     * Register a new user
     */
    @Post('register')
    async register(@Body() createUserDto: CreateUserDto) {
        console.log('Register endpoint invoked.');
        return this.userService.register(createUserDto);
    } // tested

    /**
     * Log in an existing user
     */
    @Post('login')
    async login(@Body() loginUserDto: LoginUserDto) {
        console.log('Login endpoint invoked.');
        return this.userService.login(loginUserDto);
    } // tested

    /**
     * Initiate password reset process
     */
    @Post('forgot-password')
    async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
        const email = forgotPasswordDto.email;

        if (!email) {
            throw new BadRequestException('Email is required');
        }

        console.log('Forgot Password endpoint invoked.');
        return await this.userService.forgetPassword(forgotPasswordDto);
    } // tested (deployment link)

    /**
     * Reset password using a token
     */
    @Post('reset-password')
    async resetPassword(@Query('token') token: string, @Body() resetPasswordDto: ResetPasswordDto) {
        console.log('Token:', token);
        console.log('New Password DTO:', resetPasswordDto);

        if (!token || !resetPasswordDto.newPassword) {
            throw new BadRequestException('Token and new password are required');
        }

        return await this.userService.resetPassword(token, resetPasswordDto.newPassword);
    } // tested



    @Post(':id/enroll/:courseId')
    @HttpCode(200)
    async enrollUser(
        @Param('id') userId: string,
        @Param('courseId') courseId: string,
    ): Promise<any> {
        if (!userId || !courseId) {
            throw new BadRequestException('User ID and Course ID are required.');
        }
        return await this.userService.enrollUser(userId, courseId);
    }


    /**
     * Update user profile
     */
    @UseGuards(JwtAuthGuard)
    @Patch('update/:id')
    async updateProfile(
        @Param('id') id: string,
        @Body() updateUserDto: UpdateUserDto,
        @Req() req: Request & { user: { sub: string; email: string } },
    ) {
        const userIdFromToken = req.user.sub; // Extract user ID from JWT payload

        if (userIdFromToken !== id) {
            throw new ForbiddenException('You can only update your own profile');
        }

        console.log('Update Profile endpoint invoked.');
        return this.userService.updateProfile(updateUserDto, id);
    } // tested 

    /**
     * Delete user profile
     */
    @UseGuards(JwtAuthGuard)
    @Delete('delete/:id')
    async deleteProfile(@Param('id') userId: string, @Req() req: any) {
        const userIdFromToken = req.user.sub;

        if (userIdFromToken !== userId) {
            throw new ForbiddenException('You can only delete your own profile');
        }

        console.log('Delete Profile endpoint invoked.');
        return this.userService.deleteProfile(userId);
    } // tested

    /**
     * Get user profile by ID
     */
    @UseGuards(JwtAuthGuard)
    @Get('view-profile/:id')
    async getProfile(@Param('id') id: string, @Req() req: any) {
        const userIdFromToken = req.user.sub;

        if (userIdFromToken !== id) {
            throw new UnauthorizedException('You can only access your own profile');
        }

        console.log('Get Profile endpoint invoked.');
        return this.userService.viewProfile(id);
    } // tested

    /**
     * Assign courses to a student (Instructor only)
     */
    @UseGuards(JwtAuthGuard)
    @Post('assign-course/:studentId/:courseId')
    async assignCourse(
        @Param('studentId') studentId: string,
        @Param('courseId') courseId: string,
        @Req() req: any
    ) {
        const instructorId = req.user.sub;  // Instructor ID from token
        return this.userService.assignCourse(instructorId, studentId, courseId);
    }

    // create account for student (instructor only)
    @UseGuards(JwtAuthGuard)
    @Post('create-student')
    async createStudentAccount(@Body() createStudentDto: CreateStudentDto, @Req() req: any) {
        const instructorId = req.user.sub;
        return this.userService.createStudentAccount(instructorId, createStudentDto);
    } // tested

    // /**
    //  * Delete a user (Admin only)
    //  */
    @UseGuards(JwtAuthGuard)
    @Delete('delete-user/:id')
    async deleteUser(@Param('id') id: string, @Req() req: any) {
        const adminId = req.user.sub;
        const userId = id;
        return this.userService.deleteUser(adminId, userId);
    } // tested

    /**
     * Get all users (Admin only)
     */
    @UseGuards(JwtAuthGuard)
    @Get('get-all-users')
    async getAllUsers(@Req() req: any) {
        const adminId = req.user.sub;
        return this.userService.getAllUsers(adminId);
    } // tested

    /**
    * Search for students (Instructor only)
    */
    @UseGuards(JwtAuthGuard)
    @Get('search-students')
    async searchStudents(@Query() searchStudentDto: SearchStudentDto, @Req() req: any) {
        const instructorId = req.user.sub;
        console.log('Search Students endpoint invoked.');
        return this.userService.searchStudents(searchStudentDto, instructorId);
    } // tested

    /**
     * Search for instructors
     */
    @Get('search-instructors')
    async searchInstructors(@Query() searchInstructorDto: SearchInstructorDto) {
        console.log('Search Instructors endpoint invoked.');
        return this.userService.searchInstructors(searchInstructorDto);
    } // tested

    @Get('get-role/:id')
    async getUserRole(@Param('id') userId: string) {
        console.log('Get User Role endpoint invoked.');

        if (!userId) {
            throw new BadRequestException('User Id is required');
        }

        const role = await this.userService.getUserRole(userId);

        if (!role) {
            throw new BadRequestException('User not found');
        }

        return { role };
    }

    /**
     * Get users and courses
     */
    @Get('enrolled-data')
    async getEnrolledUsersAndCourses() {
        return await this.userService.getAllData();
    }

    @Get('export-csv')
    async exportCSV(): Promise<{ message: string }> {
      try {
        const filePath = await this.userService.generateCSV();
        return { message: `Data successfully exported to ${filePath}` };
      } catch (error) {
        return { message: 'Failed to generate CSV' };
      }
    }

}

