import { useState } from 'react';
import type { StudentInfo, BookInfo, SearchResult } from './types';
import * as XLSX from 'xlsx';
import { v4 as uuidv4 } from 'uuid';
import './App.css';

export default function App() {
  const [studentInfo, setStudentInfo] = useState<StudentInfo>({ studentId: '', name: '' });
  const [books, setBooks] = useState<BookInfo[]>([]);
  const [recommendation, setRecommendation] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
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
              isbn: isbn.replace(/[-\\s]/g, ''),
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
    const selectedResults = searchResults.filter(result => selectedBooks.has(result.id));
    const newBooks: BookInfo[] = selectedResults.map(result => ({
      id: uuidv4(),
      title: result.title,
      authors: result.authors,
      publisher: result.publisher,
      publishedDate: result.publishedDate,
      isbn: result.isbn,
      price: 0 // デフォルト価格
    }));
    
    setBooks(prev => [...prev, ...newBooks]);
    setSelectedBooks(new Set());
    setSearchResults([]);
  };

  // 書籍を削除
  const removeBook = (id: string) => {
    setBooks(prev => prev.filter(book => book.id !== id));
  };

  // 書籍情報を更新
  const updateBook = (id: string, field: keyof BookInfo, value: any) => {
    setBooks(prev => prev.map(book => 
      book.id === id ? { ...book, [field]: value } : book
    ));
  };

  // Excelファイル出力
  const exportToExcel = () => {
    if (books.length === 0) {
      alert('書籍が追加されていません。');
      return;
    }

    const data = [
      ['No.', 'タイトル', '著者', '出版社', '発売日', 'ISBN', '価格'],
      ...books.map((book, index) => [
        index + 1,
        book.title,
        book.authors.join(', '),
        book.publisher,
        book.publishedDate,
        book.isbn,
        book.price
      ]),
      [],
      ['学籍番号', studentInfo.studentId],
      ['氏名', studentInfo.name],
      ['推薦理由', recommendation],
      ['合計金額', totalPrice]
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '図書選定リスト');
    
    const fileName = `図書選定リスト_${studentInfo.name || '未入力'}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  return (
    <div className="container">
      <h1>図書選定リスト作成システム</h1>
      <p className="subtitle">キーワードで直近1年の新刊書籍を検索・選定してExcelファイルを作成</p>

      {/* 学生情報入力 */}
      <div className="section">
        <h2>学生情報</h2>
        <div className="form-group">
          <label>学籍番号:</label>
          <input
            type="text"
            value={studentInfo.studentId}
            onChange={(e) => setStudentInfo(prev => ({ ...prev, studentId: e.target.value }))}
            placeholder="学籍番号を入力"
          />
        </div>
        <div className="form-group">
          <label>氏名:</label>
          <input
            type="text"
            value={studentInfo.name}
            onChange={(e) => setStudentInfo(prev => ({ ...prev, name: e.target.value }))}
            placeholder="氏名を入力"
          />
        </div>
      </div>

      {/* キーワード検索 */}
      <div className="section">
        <h2>書籍検索（直近1年の新刊）</h2>
        <div className="search-container">
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="検索キーワードを入力（例：AI、機械学習、プログラミング）"
            className="search-input"
          />
          <button 
            onClick={() => searchBooksByKeyword(searchKeyword)}
            disabled={isSearching || !searchKeyword.trim()}
            className="search-button"
          >
            {isSearching ? '検索中...' : '検索'}
          </button>
        </div>

        {searchError && (
          <div className="error-message">{searchError}</div>
        )}

        {/* 検索結果 */}
        {searchResults.length > 0 && (
          <div className="search-results">
            <h3>検索結果 ({searchResults.length}件)</h3>
            <div className="results-grid">
              {searchResults.map((result) => (
                <div key={result.id} className="result-card">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={selectedBooks.has(result.id)}
                      onChange={(e) => {
                        const newSelected = new Set(selectedBooks);
                        if (e.target.checked) {
                          newSelected.add(result.id);
                        } else {
                          newSelected.delete(result.id);
                        }
                        setSelectedBooks(newSelected);
                      }}
                    />
                    <div className="book-info">
                      {result.thumbnail && (
                        <img src={result.thumbnail} alt={result.title} className="book-thumbnail" />
                      )}
                      <div>
                        <h4>{result.title}</h4>
                        <p>著者: {result.authors.join(', ')}</p>
                        <p>出版社: {result.publisher}</p>
                        <p>発売日: {result.publishedDate}</p>
                        {result.isbn && <p>ISBN: {result.isbn}</p>}
                      </div>
                    </div>
                  </label>
                </div>
              ))}
            </div>
            
            {selectedBooks.size > 0 && (
              <button 
                onClick={addSelectedBooks}
                className="add-button"
              >
                選択した書籍をリストに追加 ({selectedBooks.size}件)
              </button>
            )}
          </div>
        )}
      </div>

      {/* 選定書籍リスト */}
      <div className="section">
        <h2>選定書籍リスト ({books.length}件)</h2>
        {books.length > 0 && (
          <div className="books-table">
            <table>
              <thead>
                <tr>
                  <th>No.</th>
                  <th>タイトル</th>
                  <th>著者</th>
                  <th>出版社</th>
                  <th>発売日</th>
                  <th>ISBN</th>
                  <th>価格</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {books.map((book, index) => (
                  <tr key={book.id}>
                    <td>{index + 1}</td>
                    <td>
                      <input
                        type="text"
                        value={book.title}
                        onChange={(e) => updateBook(book.id, 'title', e.target.value)}
                        className="table-input"
                      />
                    </td>
                    <td>{book.authors.join(', ')}</td>
                    <td>
                      <input
                        type="text"
                        value={book.publisher}
                        onChange={(e) => updateBook(book.id, 'publisher', e.target.value)}
                        className="table-input"
                      />
                    </td>
                    <td>{book.publishedDate}</td>
                    <td>
                      <input
                        type="text"
                        value={book.isbn}
                        onChange={(e) => updateBook(book.id, 'isbn', e.target.value)}
                        className="table-input"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={book.price}
                        onChange={(e) => updateBook(book.id, 'price', parseInt(e.target.value) || 0)}
                        className="table-input price-input"
                      />
                    </td>
                    <td>
                      <button 
                        onClick={() => removeBook(book.id)}
                        className="delete-button"
                      >
                        削除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div className="total-price">
              合計金額: ¥{totalPrice.toLocaleString()}
            </div>
          </div>
        )}
      </div>

      {/* 推薦理由 */}
      <div className="section">
        <h2>推薦理由</h2>
        <textarea
          value={recommendation}
          onChange={(e) => setRecommendation(e.target.value)}
          placeholder="図書を推薦する理由を記入してください"
          className="recommendation-textarea"
        />
      </div>

      {/* Excel出力 */}
      <div className="section">
        <button 
          onClick={exportToExcel}
          disabled={books.length === 0}
          className="export-button"
        >
          Excelファイルをダウンロード
        </button>
      </div>
    </div>
  );
}