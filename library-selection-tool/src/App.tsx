import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Search, 
  Trash2, 
  Download, 
  BookOpen, 
  User, 
  Calculator,
  FileText,
  AlertCircle,
  Loader2,
  Filter
} from 'lucide-react';
import { StudentInfo, BookInfo } from './types';
import * as XLSX from 'xlsx';
import { v4 as uuidv4 } from 'uuid';

export default function BookSelectionApp() {
  const [studentInfo, setStudentInfo] = useState<StudentInfo>({ studentId: '', name: '' });
  const [books, setBooks] = useState<BookInfo[]>([]);
  const [recommendation, setRecommendation] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedBooks, setSelectedBooks] = useState<Set<string>>(new Set());
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  const totalPrice = books.reduce((sum, book) => sum + book.price, 0);

  // キーワード検索（直近1年の書籍）
  const searchBooksByKeyword = async (keyword: string) => {
    if (!keyword.trim()) return;
    
    setIsSearching(true);
    setSearchError('');
    setSearchResults([]);
    
    try {
      const currentDate = new Date();
      const oneYearAgo = new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), currentDate.getDate());
      
      const searchQuery = encodeURIComponent(keyword);
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${searchQuery}&orderBy=newest&maxResults=30&langRestrict=ja`
      );
      
      if (!response.ok) {
        throw new Error('検索エラー');
      }
      
      const data = await response.json();
      
      if (data.items) {
        const recentBooks = data.items
          .map((item: any) => {
            const volumeInfo = item.volumeInfo;
            const publishedDate = volumeInfo.publishedDate;
            
            if (publishedDate) {
              const bookDate = new Date(publishedDate);
              if (bookDate < oneYearAgo) {
                return null;
              }
            }
            
            const isbn = volumeInfo.industryIdentifiers?.find(
              (id: any) => id.type === 'ISBN_13' || id.type === 'ISBN_10'
            )?.identifier || '';
            
            return {
              id: item.id,
              title: volumeInfo.title || '',
              authors: volumeInfo.authors || ['不明'],
              publisher: volumeInfo.publisher || '不明',
              publishedDate: publishedDate || '',
              isbn: isbn.replace(/[-\s]/g, ''),
              thumbnail: volumeInfo.imageLinks?.thumbnail
            };
          })
          .filter(Boolean);
        
        setSearchResults(recentBooks);
        
        if (recentBooks.length === 0) {
          setSearchError('直近1年以内に発売された該当する書籍が見つかりませんでした。');
        }
      } else {
        setSearchError('検索結果が見つかりませんでした。');
      }
    } catch (error) {
      setSearchError('検索中にエラーが発生しました。');
    } finally {
      setIsSearching(false);
    }
  };

  // 選択した書籍をリストに追加
  const addSelectedBooks = () => {
    const booksToAdd = searchResults
      .filter((result: any) => selectedBooks.has(result.id))
      .map((result: any, index: number) => ({
        id: uuidv4(),
        no: books.length + index + 1,
        title: result.title,
        seriesName: '',
        volume: '',
        edition: '',
        author: result.authors.join(', '),
        publisher: result.publisher,
        publicationYear: result.publishedDate ? parseInt(result.publishedDate.substring(0, 4)) : new Date().getFullYear(),
        isbn: result.isbn,
        language: '和書' as const,
        price: 0,
        url: ''
      }));
    
    setBooks(prev => [...prev, ...booksToAdd]);
    setSelectedBooks(new Set());
    setSearchResults([]);
    setSearchKeyword('');
  };

  // 書籍選択を切り替え
  const toggleBookSelection = (bookId: string) => {
    setSelectedBooks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(bookId)) {
        newSet.delete(bookId);
      } else {
        newSet.add(bookId);
      }
      return newSet;
    });
  };

  // 書籍を削除
  const removeBook = (id: string) => {
    setBooks(prev => {
      const filtered = prev.filter(book => book.id !== id);
      return filtered.map((book, index) => ({ ...book, no: index + 1 }));
    });
  };

  // 書籍情報を更新
  const updateBook = (id: string, field: keyof BookInfo, value: any) => {
    setBooks(prev => prev.map(book => 
      book.id === id ? { ...book, [field]: value } : book
    ));
  };

  // Excelエクスポート
  const exportToExcel = () => {
    const worksheetData = [
      ['選定リスト', '', '', '', '', '', '', '', '', '', '学籍番号', studentInfo.studentId],
      ['', '', '', '', '', '', '', '', '', '', '氏名', studentInfo.name],
      ['【選定方法・記入時の注意点について】'],
      ['★ 学術情報センターに所蔵がない資料を選定してください。'],
      ['★ １冊から受け付けます。複数回提出していただいても構いません。'],
      ['★ 行数が足りない場合は、適宜、追加してください。'],
      ['★ 図書の情報は、「図書のタイトル」「著者名」「出版者」「刊行年」「ISBN」等の必要事項を入力してください。'],
      ['★ 参考にしたWebページがあれば、URLも併せて記入してください。'],
      ['★ お申込みいただいた資料の内容や出版状況等により、購入できない場合もあります。'],
      ['★ 受付期限は2025年11月21日（金）です。'],
      [''],
      ['No', '書名・タイトル', 'シリーズ名', '巻', '版', '著者名', '出版者', '刊行年', 'ISBN\nハイフン不要', '和書・洋書の別', '価格(税抜)', 'URL'],
      ...books.map(book => [
        book.no,
        book.title,
        book.seriesName,
        book.volume,
        book.edition,
        book.author,
        book.publisher,
        book.publicationYear,
        book.isbn,
        book.language,
        book.price,
        book.url
      ]),
      ['', '', '', '', '', '', '', '', '', '価格合計', totalPrice, '']
    ];

    if (recommendation) {
      worksheetData.push(
        [''],
        ['お薦めの理由（任意）'],
        ['（後日展示等に掲載する場合があります）'],
        [recommendation]
      );
    }

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '選定リスト');
    
    const fileName = `図書選定リスト_${studentInfo.studentId || '未入力'}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
            <BookOpen className="h-8 w-8 text-primary" />
            図書選定リスト作成システム
          </h1>
          <p className="text-muted-foreground">キーワードで直近1年の新刊書籍を検索・抽出し、選定リストを自動生成</p>
        </div>

        {/* 学生情報 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              学生情報
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="studentId">学籍番号</Label>
              <Input
                id="studentId"
                value={studentInfo.studentId}
                onChange={(e) => setStudentInfo(prev => ({ ...prev, studentId: e.target.value }))}
                placeholder="学籍番号を入力"
              />
            </div>
            <div>
              <Label htmlFor="name">氏名</Label>
              <Input
                id="name"
                value={studentInfo.name}
                onChange={(e) => setStudentInfo(prev => ({ ...prev, name: e.target.value }))}
                placeholder="氏名を入力"
              />
            </div>
          </CardContent>
        </Card>

        {/* キーワード検索 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              書籍検索（直近1年の新刊書籍）
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="keyword">キーワード検索</Label>
              <div className="flex gap-2">
                <Input
                  id="keyword"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder="検索したいキーワードを入力（例：AI、機械学習、プログラミング）"
                  disabled={isSearching}
                  onKeyDown={(e) => e.key === 'Enter' && searchBooksByKeyword(searchKeyword)}
                />
                <Button 
                  onClick={() => searchBooksByKeyword(searchKeyword)}
                  disabled={!searchKeyword || isSearching}
                  className="whitespace-nowrap"
                >
                  {isSearching ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Search className="h-4 w-4 mr-2" />
                  )}
                  検索
                </Button>
              </div>
            </div>
            
            {/* 検索結果 */}
            {searchResults.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    検索結果（直近1年以内）
                    <Badge variant="secondary">{searchResults.length}件</Badge>
                  </h3>
                  <Button 
                    onClick={addSelectedBooks}
                    disabled={selectedBooks.size === 0}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    選択した書籍をリストに追加 ({selectedBooks.size})
                  </Button>
                </div>
                
                <div className="max-h-96 overflow-y-auto border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">選択</TableHead>
                        <TableHead className="min-w-[300px]">タイトル</TableHead>
                        <TableHead>著者</TableHead>
                        <TableHead>出版社</TableHead>
                        <TableHead>発売年</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {searchResults.map((result: any) => (
                        <TableRow key={result.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedBooks.has(result.id)}
                              onCheckedChange={() => toggleBookSelection(result.id)}
                            />
                          </TableCell>
                          <TableCell className="font-medium">
                            <div className="flex items-start gap-2">
                              {result.thumbnail && (
                                <img 
                                  src={result.thumbnail} 
                                  alt="書籍表紙" 
                                  className="w-8 h-10 object-cover rounded flex-shrink-0"
                                />
                              )}
                              <div className="line-clamp-2">{result.title}</div>
                            </div>
                          </TableCell>
                          <TableCell>{result.authors.join(', ')}</TableCell>
                          <TableCell>{result.publisher}</TableCell>
                          <TableCell>
                            {result.publishedDate ? new Date(result.publishedDate).getFullYear() : '不明'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
            
            {/* エラーメッセージ */}
            {searchError && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{searchError}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* 選定図書一覧 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                選定図書一覧
                <Badge variant="secondary">{books.length}冊</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                <span className="text-sm font-medium">合計: ¥{totalPrice.toLocaleString()}</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {books.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>図書が追加されていません</p>
                <p className="text-sm">上記のキーワード検索から書籍を検索・追加してください</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">No</TableHead>
                      <TableHead className="min-w-[200px]">書名</TableHead>
                      <TableHead>著者</TableHead>
                      <TableHead>出版者</TableHead>
                      <TableHead>刊行年</TableHead>
                      <TableHead>種別</TableHead>
                      <TableHead>価格</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {books.map((book) => (
                      <TableRow key={book.id}>
                        <TableCell>{book.no}</TableCell>
                        <TableCell>
                          <Input
                            value={book.title}
                            onChange={(e) => updateBook(book.id, 'title', e.target.value)}
                            className="min-w-0"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={book.author}
                            onChange={(e) => updateBook(book.id, 'author', e.target.value)}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={book.publisher}
                            onChange={(e) => updateBook(book.id, 'publisher', e.target.value)}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={book.publicationYear}
                            onChange={(e) => updateBook(book.id, 'publicationYear', parseInt(e.target.value) || 0)}
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <Select 
                            value={book.language} 
                            onValueChange={(value: '和書' | '洋書') => updateBook(book.id, 'language', value)}
                          >
                            <SelectTrigger className="w-20">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="和書">和書</SelectItem>
                              <SelectItem value="洋書">洋書</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={book.price}
                            onChange={(e) => updateBook(book.id, 'price', parseInt(e.target.value) || 0)}
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeBook(book.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 推薦理由 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>お薦めの理由（任意）</CardTitle>
            <p className="text-sm text-muted-foreground">後日展示等に掲載する場合があります</p>
          </CardHeader>
          <CardContent>
            <Textarea
              value={recommendation}
              onChange={(e) => setRecommendation(e.target.value)}
              placeholder="図書を推薦する理由を記入してください..."
              rows={4}
            />
          </CardContent>
        </Card>

        {/* エクスポート */}
        <div className="flex justify-center">
          <Button 
            onClick={exportToExcel}
            size="lg"
            disabled={books.length === 0 || !studentInfo.studentId || !studentInfo.name}
            className="gap-2"
          >
            <Download className="h-5 w-5" />
            Excelファイルをダウンロード
          </Button>
        </div>

        {(books.length === 0 || !studentInfo.studentId || !studentInfo.name) && (
          <p className="text-center text-sm text-muted-foreground mt-2">
            ダウンロードには学生情報の入力と最低1冊の図書追加が必要です
          </p>
        )}
      </div>
    </div>
  );
}