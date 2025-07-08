export interface StudentInfo {
  studentId: string;
  name: string;
}

export interface BookInfo {
  id: string;
  no: number;
  title: string;
  seriesName?: string;
  volume?: string;
  edition?: string;
  author: string;
  publisher: string;
  publicationYear: number;
  isbn: string;
  language: '和書' | '洋書';
  price: number;
  url?: string;
  reason?: string;
}

export interface SelectionListData {
  studentInfo: StudentInfo;
  books: BookInfo[];
  totalPrice: number;
  recommendation?: string;
}

export interface OpenBDResponse {
  summary: {
    isbn: string;
    title: string;
    author: string;
    publisher: string;
    pubdate: string;
    cover?: string;
  };
  onix?: {
    DescriptiveDetail?: {
      TitleDetail?: Array<{
        TitleElement?: Array<{
          TitleText?: {
            content: string;
          };
        }>;
      }>;
      Contributor?: Array<{
        PersonName?: {
          content: string;
        };
      }>;
    };
    PublishingDetail?: {
      Publisher?: Array<{
        PublisherName?: {
          content: string;
        };
      }>;
    };
    ProductSupply?: {
      SupplyDetail?: Array<{
        Price?: Array<{
          PriceAmount?: {
            content: string;
          };
        }>;
      }>;
    };
  };
}