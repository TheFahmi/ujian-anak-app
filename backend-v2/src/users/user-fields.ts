// Whitelist kolom supaya spread dari request body tidak mengirim field asing ke Prisma.
export function pilihFieldUser(src: any) {
    const out: any = {};
    for (const k of [
        'id', 'username', 'password', 'email', 'emailTerverifikasi',
        'role', 'kelas', 'mata_pelajaran', 'kelas_assign', 'avatar', 'children',
    ]) {
        if (src[k] !== undefined) out[k] = src[k];
    }
    if (out.email === '' || out.email === null) out.email = null;
    if (out.kelas === null) out.kelas = '';
    return out;
}

export function pilihFieldSubject(src: any) {
    const out: any = {};
    for (const k of ['id', 'nama', 'kelas', 'durasi', 'soal']) {
        if (src[k] !== undefined) out[k] = src[k];
    }
    return out;
}
