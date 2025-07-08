export interface StudentInfo {
  studentId: string;
  name: string;
}

export interface BookInfo {
  id: string;
  title: string;
  authors: string[];
  publisher: string;
  publishedDate: string;
  isbn: string;
  price: number;
}

export interface SearchResult {
  id: string;
  title: string;
  authors: string[];
  publisher: string;
  publishedDate: string;
  isbn: string;
  thumbnail?: string;
}

export interface GoogleBooksResponse {
  items: GoogleBookItem[];
}

export interface GoogleBookItem {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    publisher?: string;
    publishedDate?: string;
    industryIdentifiers?: Array<{
      type: string;
      identifier: string;
    }>;
    imageLinks?: {
      thumbnail: string;
    };
  };
}