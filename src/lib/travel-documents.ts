import Dexie, { Table } from 'dexie';

export interface TravelDocument {
  id?: number;
  type: 'ticket' | 'vuelo' | 'hotel' | 'nota';
  createdAt: Date;
  image?: Blob;
  imageData?: string;
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

export async function deleteDocument(id: number): Promise<void> {
  return db.documents.delete(id);
}

export async function updateDocument(id: number, changes: Partial<TravelDocument>): Promise<number> {
  return db.documents.update(id, changes);
}

export async function getDocumentCount(): Promise<number> {
  return db.documents.count();
}