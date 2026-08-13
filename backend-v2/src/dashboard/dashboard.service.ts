import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
    constructor(private prisma: PrismaService) { }

    async getTeacherDashboard(userId: string) {
        // Guru hanya melihat data sesuai assign: mata_pelajaran + kelas_assign.
        const guru = await this.prisma.user.findUnique({ where: { id: userId } });
        const mapelIds = guru?.mata_pelajaran || [];
        const kelasAssign = guru?.kelas_assign || [];

        // Siswa: filter by kelas_assign kalau ada; kalau kosong, semua siswa.
        const siswaFilter: any = { role: 'siswa' };
        if (kelasAssign.length > 0) {
            siswaFilter.kelas = { in: kelasAssign };
        }

        const [totalStudents, siswaList, subjects, results] = await Promise.all([
            this.prisma.user.count({ where: siswaFilter }),
            this.prisma.user.findMany({ where: siswaFilter }),
            // Mapel yang di-assign; kosong = semua mapel.
            mapelIds.length > 0
                ? this.prisma.subject.findMany({ where: { id: { in: mapelIds } } })
                : this.prisma.subject.findMany(),
            this.prisma.result.findMany({ orderBy: { date: 'desc' }, take: 20 }),
        ]);

        // Filter hasil hanya dari siswa di kelas assign
        const siswaIds = siswaList.map(s => s.id);
        const myResults = siswaIds.length > 0
            ? results.filter(r => siswaIds.includes(r.userId))
            : [];

        // Enrich results with student names
        const enrichedResults = await Promise.all(myResults.slice(0, 5).map(async (result) => {
            const student = await this.prisma.user.findUnique({ where: { id: result.userId } });
            return {
                ...result,
                _id: result.id,
                studentName: student ? student.username : 'Unknown Student',
                studentAvatar: student ? student.avatar : '/images/avatar-student.png',
            };
        }));

        // Ujian yang dibuat guru: mapel assign
        const examCount = mapelIds.length > 0
            ? await this.prisma.result.count({ where: { subjectId: { in: mapelIds } } })
            : results.length;

        return {
            stats: {
                totalStudents,
                totalExams: examCount,
            },
            mapel: subjects.map(s => ({
                id: s.id,
                nama: s.nama,
                kelas: s.kelas,
                jumlahSoal: (Array.isArray(s.soal) ? s.soal.length : 0),
            })),
            kelas: kelasAssign,
            recentActivity: enrichedResults,
        };
    }

    // Daftar siswa yang terlihat guru (filter kelas_assign)
    async getTeacherStudents(userId: string) {
        const guru = await this.prisma.user.findUnique({ where: { id: userId } });
        const kelasAssign = guru?.kelas_assign || [];

        const siswaFilter: any = { role: 'siswa' };
        if (kelasAssign.length > 0) {
            siswaFilter.kelas = { in: kelasAssign };
        }

        const siswa = await this.prisma.user.findMany({
            where: siswaFilter,
            orderBy: { username: 'asc' },
        });

        // Ambil hasil terakhir per siswa
        const siswaIds = siswa.map(s => s.id);
        const hasil = await this.prisma.result.findMany({
            where: { userId: { in: siswaIds } },
            orderBy: { date: 'desc' },
            take: 500,
        });

        const perSiswa = siswa.map(s => {
            const hasilSiswa = hasil.filter(h => h.userId === s.id);
            const rata = hasilSiswa.length > 0
                ? Math.round(hasilSiswa.reduce((a, h) => a + h.score, 0) / hasilSiswa.length)
                : null;
            return {
                id: s.id,
                nama: s.username,
                kelas: s.kelas,
                avatar: s.avatar,
                jumlahUjian: hasilSiswa.length,
                rataNilai: rata,
                terakhir: hasilSiswa[0] ? {
                    subjectName: hasilSiswa[0].subjectName,
                    score: hasilSiswa[0].score,
                    date: hasilSiswa[0].date,
                } : null,
            };
        });

        return { siswa: perSiswa, kelas: kelasAssign };
    }

    // Detail mapel yang di-assign ke guru (validasi akses)
    async getTeacherSubject(userId: string, subjectId: string) {
        const guru = await this.prisma.user.findUnique({ where: { id: userId } });
        const mapelIds = guru?.mata_pelajaran || [];

        if (mapelIds.length > 0 && !mapelIds.includes(subjectId)) {
            throw new Error('Akses ditolak: mapel ini tidak di-assign ke kamu');
        }

        const subject = await this.prisma.subject.findUnique({ where: { id: subjectId } });
        if (!subject) throw new Error('Mapel tidak ditemukan');

        // Hitung jumlah siswa di kelas mapel (kalau guru punya kelas assign)
        const kelasAssign = guru?.kelas_assign || [];
        const siswaFilter: any = { role: 'siswa' };
        if (kelasAssign.length > 0) siswaFilter.kelas = { in: kelasAssign };
        const jumlahSiswa = await this.prisma.user.count({ where: siswaFilter });

        // Hasil ujian mapel ini dari siswa terlihat
        const siswa = await this.prisma.user.findMany({ where: siswaFilter });
        const siswaIds = siswa.map(s => s.id);
        const hasil = await this.prisma.result.findMany({
            where: { subjectId, userId: { in: siswaIds } },
            orderBy: { date: 'desc' },
            take: 200,
        });

        const rata = hasil.length > 0
            ? Math.round(hasil.reduce((a, h) => a + h.score, 0) / hasil.length)
            : null;

        return {
            mapel: { id: subject.id, nama: subject.nama, kelas: subject.kelas, durasi: subject.durasi },
            jumlahSoal: Array.isArray(subject.soal) ? subject.soal.length : 0,
            jumlahSiswa,
            jumlahUjian: hasil.length,
            rataNilai: rata,
        };
    }

    async getParentDashboard(parentId: string) {
        const parent = await this.prisma.user.findUnique({ where: { id: parentId } });
        if (!parent || !parent.children || parent.children.length === 0) {
            return {
                hasChildren: false,
                stats: { averageScore: 0, totalExams: 0 },
                recentResults: [],
            };
        }

        const childIds = parent.children;

        const [results, allResults, childrenDetails] = await Promise.all([
            this.prisma.result.findMany({
                where: { userId: { in: childIds } },
                orderBy: { date: 'desc' },
                take: 10,
            }),
            this.prisma.result.findMany({
                where: { userId: { in: childIds } },
                select: { score: true },
            }),
            this.prisma.user.findMany({ where: { id: { in: childIds } } }),
        ]);

        const totalExams = allResults.length;
        const totalScore = allResults.reduce((acc, curr) => acc + curr.score, 0);
        const averageScore = totalExams > 0 ? Math.round(totalScore / totalExams) : 0;

        return {
            hasChildren: true,
            children: childrenDetails,
            stats: {
                averageScore,
                totalExams,
            },
            recentResults: results.map((r) => ({ ...r, _id: r.id })),
        };
    }
}
