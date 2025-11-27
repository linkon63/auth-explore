export interface Note {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    file?: Attachment[];
}

export type Attachment = {
    fileName: string;
    url: string;
    mimeType?: string;
    size?: number;
    originalName?: string;
};

export type UploadJob = {
    id: string;
    name: string;
    progress: number;
    status: "uploading" | "done" | "error";
    error?: string;
};