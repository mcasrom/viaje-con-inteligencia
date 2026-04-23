import Dexie, { Table } from 'dexie';

export interface TravelDocument {
  id?: number;
  type: 'ticket' | 'vuelo' | 'hotel' | 'nota' | 'ref';
  createdAt: Date;
  image?: Blob;
  imageData?: string;
  pdfData?: string;
  text: string;
  extractedText?: string;
  location?: {
    country: string;
    city: string;
  };
  title: string;
}

export class TravelDocumentsDB extends Dexie {
  documents!: Table<TravelDocument, number>;

  constructor() {
    super('ViajeInteligenciaDocs');
    this.version(1).stores({
      documents: '++id, type, createdAt, title',
    });
  }
}

export const db = new TravelDocumentsDB();

export async function addDocument(doc: Omit<TravelDocument, 'id'>): Promise<number> {
  return db.documents.add(doc as TravelDocument);
}

export async function getDocuments(type?: string): Promise<TravelDocument[]> {
  if (type && type !== 'all') {
    return db.documents.where('type').equals(type).reverse().sortBy('createdAt');
  }
  return db.documents.reverse().sortBy('createdAt');
}

export async function getAllDocuments(): Promise<TravelDocument[]> {
  return db.documents.reverse().sortBy('createdAt');
}

export async function deleteDocument(id: number): Promise<void> {
  return db.documents.delete(id);
}

export async function updateDocument(id: number, changes: Partial<TravelDocument>): Promise<number> {
  return db.documents.update(id, changes);
}

export async function getDocumentCount(): Promise<number> {
  return db.documents.count();
}

export async function exportToZip(): Promise<Blob> {
  const docs = await getAllDocuments();
  
  const files: { name: string; data: string }[] = [];
  
  for (const doc of docs) {
    if (doc.imageData) {
      const ext = doc.imageData.includes('image/png') ? 'png' : 'jpg';
      const filename = `${doc.type}_${doc.id}_${Date.now()}.${ext}`;
      files.push({ name: filename, data: doc.imageData });
    }
    if (doc.text) {
      const filename = `${doc.type}_${doc.id}.txt`;
      files.push({ name: filename, data: doc.text });
    }
  }
  
  if (files.length === 0) {
    return new Blob(['No documents to export'], { type: 'text/plain' });
  }
  
  const content = files.map(f => `${f.name}\n---\n${f.data.split(',')[1] || f.data}\n`).join('\n\n');
  return new Blob([content], { type: 'text/plain' });
}