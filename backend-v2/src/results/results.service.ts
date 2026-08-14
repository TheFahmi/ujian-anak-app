import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// Frontend v2 masih membaca `result._id` (history & review page), jadi hasil
// Prisma diberi alias _id = id supaya kontrak API tidak berubah.
function denganIdLama(row: any) {
    return { ...row, _id: row.id };
}

@Injectable()
export class ResultsService {
    constructor(private prisma: PrismaService) { }

    // Get all results for a user (original backend logic)
    async getResultsByUser(userId: string) {
        const results = await this.prisma.result.findMany({
            where: { userId },
            orderBy: { date: 'desc' },
        });
        return results.map(denganIdLama);
    }

    // Paginated results for history pages: returns { items, total, page, totalPages }
    async getResultsPaginated(userId: string, page = 1, limit = 10) {
        const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
        const limitNum = Math.min(50, Math.max(1, parseInt(String(limit), 10) || 10));
        const skip = (pageNum - 1) * limitNum;

        const [total, results] = await Promise.all([
            this.prisma.result.count({ where: { userId } }),
            this.prisma.result.findMany({
                where: { userId },
                orderBy: { date: 'desc' },
                skip,
                take: limitNum,
            }),
        ]);

        return {
            items: results.map(denganIdLama),
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum),
        };
    }

    async getResult(id: string) {
        if (!id) {
            throw new BadRequestException('Result ID is required');
        }

        const result = await this.prisma.result.findUnique({ where: { id } });
        if (!result) {
            throw new NotFoundException(`Result not found with ID: ${id}`);
        }
        return denganIdLama(result);
    }
}
