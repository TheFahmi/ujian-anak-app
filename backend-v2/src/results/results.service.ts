import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Result, ResultDocument } from '../schemas/result.schema';

@Injectable()
export class ResultsService {
    constructor(
        @InjectModel(Result.name) private resultModel: Model<ResultDocument>,
    ) { }

    // Get all results for a user (original backend logic)
    async getResultsByUser(userId: string) {
        const results = await this.resultModel.find({ userId }).sort({ date: -1 }).exec();
        // Ensure _id is serialized as string
        return results.map(result => ({
            ...result.toObject(),
            _id: result._id.toString()
        }));
    }

    async getResult(id: string) {
        if (!id) {
            throw new BadRequestException('Result ID is required');
        }

        // Check if id is a valid ObjectId (24 hex characters)
        if (!Types.ObjectId.isValid(id)) {
            console.error(`Invalid result ID format. Received: "${id}" (length: ${id.length}, type: ${typeof id})`);
            throw new BadRequestException(`Invalid result ID format. Expected MongoDB ObjectId (24 hex characters), got: ${id.substring(0, 50)}`);
        }

        try {
            const result = await this.resultModel.findById(id).exec();
            if (!result) {
                throw new NotFoundException(`Result not found with ID: ${id}`);
            }
            // Ensure _id is serialized as string
            return {
                ...result.toObject(),
                _id: result._id.toString()
            };
        } catch (error) {
            console.error(`Error fetching result with ID "${id}":`, error);
            throw error;
        }
    }
}
