from http.server import BaseHTTPRequestHandler
import json
import os
import requests
from bs4 import BeautifulSoup
import google.generativeai as genai
from urllib.parse import quote_plus

# Configure Gemini API
genai.configure(api_key=os.environ.get('GOOGLE_GENERATIVE_API_KEY'))

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        
        try:
            data = json.loads(post_data.decode('utf-8'))
            mode = data.get('mode', 'web')
            
            if mode == 'web':
                result = self.scrape_web(data)
            else:
                result = self.search_research(data)
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(result).encode())
            
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            error_response = {'status': 'error', 'message': str(e)}
            self.wfile.write(json.dumps(error_response).encode())
    
    def scrape_web(self, data):
        url = data.get('url')
        query = data.get('query')
        
        # Fetch webpage
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        # Parse HTML
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Remove script and style elements
        for script in soup(["script", "style", "nav", "footer"]):
            script.decompose()
        
        # Get text content
        text = soup.get_text(separator='\n', strip=True)
        text = '\n'.join([line for line in text.split('\n') if line.strip()])
        
        # Use Gemini to extract information
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        prompt = f"""
        Analyze the following webpage content and {query}
        
        Provide the extracted information in a clear, structured format with proper sections and bullet points.
        
        Webpage Content:
        {text[:30000]}  # Limit to avoid token limits
        """
        
        response = model.generate_content(prompt)
        
        return {
            'status': 'success',
            'extracted_info': response.text,
            'source_url': url
        }
    
    def search_research(self, data):
        query = data.get('query')
        year_from = data.get('year_from', 2020)
        year_to = data.get('year_to', 2025)
        
        # Build Google Scholar URL
        search_query = quote_plus(query)
        scholar_url = f"https://scholar.google.com/scholar?q={search_query}&as_ylo={year_from}&as_yhi={year_to}"
        
        # Fetch results
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        response = requests.get(scholar_url, headers=headers, timeout=10)
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Extract paper information
        papers = []
        for result in soup.select('.gs_ri')[:10]:  # Top 10 results
            title_elem = result.select_one('.gs_rt')
            title = title_elem.get_text() if title_elem else "N/A"
            
            authors_elem = result.select_one('.gs_a')
            authors = authors_elem.get_text() if authors_elem else "N/A"
            
            snippet_elem = result.select_one('.gs_rs')
            snippet = snippet_elem.get_text() if snippet_elem else ""
            
            link_elem = title_elem.select_one('a') if title_elem else None
            link = link_elem['href'] if link_elem and link_elem.has_attr('href') else ""
            
            papers.append({
                'title': title,
                'authors': authors,
                'snippet': snippet,
                'url': link
            })
        
        # Use Gemini to synthesize information
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        papers_text = "\n\n".join([
            f"Paper {i+1}:\nTitle: {p['title']}\nAuthors: {p['authors']}\nSummary: {p['snippet']}"
            for i, p in enumerate(papers)
        ])
        
        prompt = f"""
        Based on these research papers about "{query}" published between {year_from}-{year_to}, 
        provide a comprehensive summary of the current research landscape, key findings, and trends.
        
        Papers:
        {papers_text}
        
        Provide a well-structured analysis with proper citations to the paper numbers.
        """
        
        response = model.generate_content(prompt)
        
        # Format citations
        citations = []
        for i, paper in enumerate(papers):
            # Parse authors and year from the Google Scholar format
            author_parts = paper['authors'].split('-')
            year_match = author_parts[1].strip().split(',')[0] if len(author_parts) > 1 else "N/A"
            
            citations.append({
                'title': paper['title'],
                'authors': author_parts[0].strip() if author_parts else "N/A",
                'year': year_match,
                'venue': author_parts[1].strip() if len(author_parts) > 1 else "N/A",
                'url': paper['url']
            })
        
        return {
            'status': 'success',
            'summary': response.text,
            'citations': citations,
            'papers_found': len(papers)
        }
