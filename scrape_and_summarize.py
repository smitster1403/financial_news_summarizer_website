import pandas as pd
import gensim, sumy
import numpy as np
import requests, time, random
from bs4 import BeautifulSoup
from pprint import pprint
import os

# Create data directory if it doesn't exist
os.makedirs('data', exist_ok=True)

## Scraping from MoneyControl
# Fetch 5 pages of stock news
base_url = 'https://www.moneycontrol.com/news/business/stocks/'
all_responses = []
# scrape 5 pages worth articles

for page in range(1, 9):  # Pages 1 to 8
    if page == 1:
        url = base_url
    else:
        url = f'{base_url}page-{page}/'
    
    print(f"Fetching page {page}: {url}")
    
    response = requests.get(url)
    
    if response.status_code == 200:
        all_responses.append(response)
        print(f"Successfully fetched page {page}")
    else:
        print(f"Failed to fetch page {page}, status code: {response.status_code}")
    
    # Be respectful to the server
    time.sleep(random.uniform(3, 6))

# Keep the last response for compatibility with existing code
response = all_responses[0] if all_responses else None

print(f"Fetched {len(all_responses)} pages successfully")

# Parse the HTML
soup = BeautifulSoup(response.text, 'html.parser')
articles = soup.find_all('li', class_='clearfix')

titles = []
links = []
article_content = []
print(len(articles))

# Process all pages that were fetched
all_titles = []
all_links = []
all_contents = []

# Loop through all responses
for i, response in enumerate(all_responses):
    # Parse the HTML
    page_soup = BeautifulSoup(response.text, 'html.parser')
    
    # Find all article elements on the page
    page_articles = page_soup.find_all('li', class_='clearfix')
    
    print(f"Processing page {i+1}: Found {len(page_articles)} articles")
    
    # Extract data from each article
    for article in page_articles:
        # Extract title and link
        title_tag = article.find('h2')
        if title_tag and title_tag.find('a'):
            title = title_tag.find('a').text.strip()
            link = title_tag.find('a').get('href')
            
            try:
                a_response = requests.get(link)
                if a_response.status_code != 200:
                    print(f"Can't read this link: {link}")
                    continue
                
                # Be respectful to the server
                time.sleep(random.uniform(1, 3))
                
                a_soup = BeautifulSoup(a_response.text, 'html.parser')
                a_content = a_soup.find('div', class_='content_wrapper')
                
                if a_content:
                    p = a_content.find_all('p')
                    if p:
                        content = ' '.join([x.text.strip() for x in p])
                        
                        # Only append if we have actual content
                        if content.strip():
                            all_titles.append(title)
                            all_links.append(link)
                            all_contents.append(content)
            except Exception as e:
                print(f"Error processing article {title}: {e}")

# Create DataFrame
news_df = pd.DataFrame({
    'title': all_titles,
    'link': all_links,
    'content': all_contents
})

# Display the DataFrame
print(f"Found {len(news_df)} articles across {len(all_responses)} pages")

# Save to CSV
news_df.to_csv('data/moneycontrol_articles.csv', index=False)
print("Data saved to CSV file")

## Scraping from MarketBeat
# Fetch the page for stocks news
url = 'https://www.marketbeat.com/headlines/'

response_2 = requests.get(url)
time.sleep(10)  # allow javascript to load
print(f"MarketBeat response status code: {response_2.status_code}")

soup = BeautifulSoup(response_2.text, 'html.parser')
articles = soup.find_all('a', class_='no-a c-black position-absolute w-100 h-100')

for a in articles:
    print(f"\n{a.get('href')}")
    
    '''''
        This gets you the link:
        
            a.get('href')
            
        This gets you the title:

            a.text
    '''''
    title = ' '.join(a.text.split()[1:])
    print(f"{title}")

titles = []
links = []
contents = []

for article in articles:
    a_tag = article.get('href')  # get the link
    if a_tag:
        title = ' '.join(article.text.split()[1:])
        link = a_tag
    
        # Fetch the article page
        article_response = requests.get(link)
        if article_response.status_code != 200:
            print(f"Couldn't read link: {link}")
            continue

        article_soup = BeautifulSoup(article_response.text, 'html.parser')
        try:
            para = article_soup.find('div', id='articlecontent').find_all('p')
            content = ' '.join([p.text.strip() for p in para])

            titles.append(title)
            links.append(link)
            contents.append(content)
        except:
            print(f"Couldn't parse article content for: {link}")
        
        # Pause between requests to be respectful to the server
        time.sleep(1)

# Create DataFrame and save to CSV with the column names: title, link, content.
news_df = pd.DataFrame({
    'title': titles,
    'link': links,
    'content': contents
})
news_df.to_csv('./data/marketbeat_articles.csv', index=False)
print(f"Data saved to CSV file. {len(news_df)} articles scraped.")

### Combine all the articles into one dataframe and precprocess
# Read both CSV files
moneycontrol_df = pd.read_csv('data/moneycontrol_articles.csv')
marketbeat_df = pd.read_csv('data/marketbeat_articles.csv')

moneycontrol_df = moneycontrol_df.drop_duplicates()
moneycontrol_df = moneycontrol_df.dropna()
marketbeat_df = marketbeat_df.drop_duplicates()
marketbeat_df = marketbeat_df.dropna()

# Combine both dataframes
combined_df = pd.concat([moneycontrol_df, marketbeat_df], ignore_index=True)

# Basic preprocessing
def preprocess_content(content):
    if isinstance(content, str):
        # Remove unwanted promotional text
        unwanted_phrases = [
            "Before you make your next trade",
            "MarketBeat keeps track of",
            "Our team has identified",
            "Enter your email address",
            "Get stock market alerts:Sign Up",
            "Catch all the market action on our live blog"
        ]
        
        for phrase in unwanted_phrases:
            if phrase in content:
                content = content[:content.find(phrase)].strip()
        
        # Remove extra whitespace
        content = ' '.join(content.split())
        return content
    return ''

# Apply preprocessing
combined_df['content'] = combined_df['content'].apply(preprocess_content)

# Remove rows with empty content
combined_df = combined_df.dropna()
combined_df = combined_df.drop_duplicates()

# Display info about the combined dataset
print(f"Total articles: {len(combined_df)}")
print(f"Articles by source:")

# Save the combined dataset
combined_df.to_csv('data/combined_articles.csv', index=False)
print("Combined dataset saved to 'data/combined_articles.csv'")

## Let's do summarization here
from sumy.parsers.plaintext import PlaintextParser
from sumy.nlp.tokenizers import Tokenizer
from sumy.summarizers.lex_rank import LexRankSummarizer
from sumy.summarizers.luhn import LuhnSummarizer
from sumy.summarizers.lsa import LsaSummarizer
from sumy.summarizers.text_rank import TextRankSummarizer

from sumy.nlp.stemmers import Stemmer
from sumy.utils import get_stop_words

lex_rank = LexRankSummarizer()
luhn = LuhnSummarizer()
lsa = LsaSummarizer()
text_rank = TextRankSummarizer()

def lexrank_summary(df=combined_df):
    for i in range(len(df)):
        c = df.iloc[i]['content']
        parser = PlaintextParser.from_string(c, Tokenizer("english"))
        summary = lex_rank(parser.document, sentences_count=1)
        summarized = ' '.join([str(sent) for sent in summary])
        df.loc[i, 'summary_lexrank'] = summarized
        
def luhn_summary(df=combined_df):
    for i in range(len(df)):
        c = df.iloc[i]['content']
        parser = PlaintextParser.from_string(c, Tokenizer("english"))
        summary = luhn(parser.document, sentences_count=1)
        summarized = ' '.join([str(sent) for sent in summary])
        df.loc[i, 'summary_luhn'] = summarized

def lsa_summary(df=combined_df):
    for i in range(len(df)):
        c = df.iloc[i]['content']
        parser = PlaintextParser.from_string(c, Tokenizer("english"))
        summary = lsa(parser.document, sentences_count=1)
        summarized = ' '.join([str(sent) for sent in summary])
        df.loc[i, 'summary_lsa'] = summarized

def textrank_summary(df=combined_df):
    for i in range(len(df)):
        c = df.iloc[i]['content']
        parser = PlaintextParser.from_string(c, Tokenizer("english"))
        summary = text_rank(parser.document, sentences_count=1)
        summarized = ' '.join([str(sent) for sent in summary])
        df.loc[i, 'summary_textrank'] = summarized

# Introduce new columns into the df
combined_df['summary_lexrank'] = "LexRankSummary"
combined_df['summary_luhn'] = "LuhnSummary"
combined_df['summary_lsa'] = "LsaSummary"
combined_df['summary_textrank'] = "TextRankSummary"

lexrank_summary(combined_df)
luhn_summary(combined_df)
lsa_summary(combined_df)
textrank_summary(combined_df)

# Drop rows with null values and duplicates, making sure to assign results back to dataframe
combined_df = combined_df.dropna()
combined_df = combined_df.drop_duplicates()

# Display the size of the cleaned dataframe
print(f"After removing null values and duplicates: {len(combined_df)} articles remaining")

# Save the cleaned dataset
combined_df.to_csv('data/combined_articles_cleaned.csv', index=False)
print("Cleaned dataset saved to 'data/combined_articles_cleaned.csv'")

### Calculate the ROUGE scores for each of the summaries vs the original content.
try:
    from rouge_score import rouge_scorer
    import seaborn as sns
    import matplotlib.pyplot as plt
    
    print(f"\n\n{'-'*100}ROUGE score for the LexRank Summaries")
    scorer = rouge_scorer.RougeScorer(['rouge1', 'rougeL'], use_stemmer=True)
    scores = scorer.score(combined_df.iloc[10]['content'], combined_df.iloc[10]['summary_lexrank'])
    print(f"""
      For the following sentence:\n
     {combined_df.iloc[10]['content']}\n
      We use the following lexrank performed summary:\n
      {combined_df.iloc[10]['summary_lexrank']}\n
      We get the following ROUGE scores:\n
      rouge1:{scores['rouge1']}\n
      rougeL:{scores['rougeL']}
      """)

    print(f"\n\n{'-'*100}ROUGE score for the Luhn Summaries ")

    scorer = rouge_scorer.RougeScorer(['rouge1', 'rougeL'], use_stemmer=True)
    scores = scorer.score(combined_df.iloc[10]['content'], combined_df.iloc[10]['summary_luhn'])
    print(f"""
      For the following sentence:\n
     {combined_df.iloc[10]['content']}\n
      We use the following luhn performed summary:\n
      {combined_df.iloc[10]['summary_luhn']}\n
      We get the following ROUGE scores:\n
      rouge1:{scores['rouge1']}\n
      rougeL:{scores['rougeL']}
      """)

    print(f"\n\n{'-'*100}ROUGE score for the LSA Summaries ")
    scorer = rouge_scorer.RougeScorer(['rouge1', 'rougeL'], use_stemmer=True)
    scores = scorer.score(combined_df.iloc[10]['content'], combined_df.iloc[10]['summary_lsa'])
    print(f"""
      For the following sentence:\n
     {combined_df.iloc[10]['content']}\n
      We use the following lsa performed summary:\n
      {combined_df.iloc[10]['summary_lsa']}\n
      We get the following ROUGE scores:\n
      rouge1:{scores['rouge1']}\n
      rougeL:{scores['rougeL']}
      """)

    print(f"\n\n{'-'*100}ROUGE score for the TextRank Summaries ")

    scorer = rouge_scorer.RougeScorer(['rouge1', 'rougeL'], use_stemmer=True)
    scores = scorer.score(combined_df.iloc[10]['content'], combined_df.iloc[10]['summary_textrank'])
    print(f"""
      For the following sentence:\n
     {combined_df.iloc[10]['content']}\n
      We use the following textrank performed summary:\n
      {combined_df.iloc[10]['summary_textrank']}\n
      We get the following ROUGE scores:\n
      rouge1:{scores['rouge1']}\n
      rougeL:{scores['rougeL']}
      """)
    
    # Calculate ROUGE scores for all articles and all summarization methods
    def calculate_rouge_scores(df, col_prefix='summary_'):
        # Initialize dictionary to store scores - now with more metrics
        all_scores = {
                  'lexrank': {'rouge1': [], 'rouge2': [], 'rougeL': [], 'rougeLsum': []},
                  'luhn': {'rouge1': [], 'rouge2': [], 'rougeL': [], 'rougeLsum': []},
                  'lsa': {'rouge1': [], 'rouge2': [], 'rougeL': [], 'rougeLsum': []},
                  'textrank': {'rouge1': [], 'rouge2': [], 'rougeL': [], 'rougeLsum': []}
            }
            
        # Initialize the scorer with additional metrics
        scorer = rouge_scorer.RougeScorer(['rouge1', 'rouge2', 'rougeL', 'rougeLsum'], use_stemmer=True)
            
        # Calculate scores for each article
        for i in range(len(df)):
            content = df.iloc[i]['content']
                  
            # For each summary type
            for method in all_scores.keys():
                summary_col = f'{col_prefix}{method}'
                summary = df.iloc[i][summary_col]            
                # Calculate scores
                scores = scorer.score(content, summary)
                        
                # Store F1 scores for all metrics
                all_scores[method]['rouge1'].append(scores['rouge1'].fmeasure)
                all_scores[method]['rouge2'].append(scores['rouge2'].fmeasure)
                all_scores[method]['rougeL'].append(scores['rougeL'].fmeasure)
                all_scores[method]['rougeLsum'].append(scores['rougeLsum'].fmeasure)
            
        return all_scores

    # Calculate scores for all articles
    rouge_scores = calculate_rouge_scores(combined_df)

    # Calculate average scores for each method
    avg_scores = {
            method: {
                  metric: sum(values)/len(values) 
                  for metric, values in metrics.items()
            } 
            for method, metrics in rouge_scores.items()
    }

    # Print average scores with all metrics
    print("\nAverage ROUGE Scores across all articles:")
    for method, metrics in avg_scores.items():
        print(f"{method.capitalize()}:")
        print(f"  ROUGE-1 = {metrics['rouge1']:.4f}")
        print(f"  ROUGE-2 = {metrics['rouge2']:.4f}")
        print(f"  ROUGE-L = {metrics['rougeL']:.4f}")
        print(f"  ROUGE-Lsum = {metrics['rougeLsum']:.4f}")
        print()

    # Visualize the results
    # Set up the figure with 4 subplots (one for each ROUGE metric)
    plt.figure(figsize=(16, 12))
    methods = list(avg_scores.keys())

    # Plot ROUGE-1 scores
    plt.subplot(2, 2, 1)
    rouge1_scores = [avg_scores[method]['rouge1'] for method in methods]
    sns.barplot(x=methods, y=rouge1_scores)
    plt.title('Average ROUGE-1 Scores')
    plt.ylabel('ROUGE-1 (F1)')
    plt.xticks(rotation=45)

    # Plot ROUGE-2 scores
    plt.subplot(2, 2, 2)
    rouge2_scores = [avg_scores[method]['rouge2'] for method in methods]
    sns.barplot(x=methods, y=rouge2_scores)
    plt.title('Average ROUGE-2 Scores')
    plt.ylabel('ROUGE-2 (F1)')
    plt.xticks(rotation=45)

    # Plot ROUGE-L scores
    plt.subplot(2, 2, 3)
    rougeL_scores = [avg_scores[method]['rougeL'] for method in methods]
    sns.barplot(x=methods, y=rougeL_scores)
    plt.title('Average ROUGE-L Scores')
    plt.ylabel('ROUGE-L (F1)')
    plt.xticks(rotation=45)

    # Plot ROUGE-Lsum scores
    plt.subplot(2, 2, 4)
    rougeLsum_scores = [avg_scores[method]['rougeLsum'] for method in methods]
    sns.barplot(x=methods, y=rougeLsum_scores)
    plt.title('Average ROUGE-Lsum Scores')
    plt.ylabel('ROUGE-Lsum (F1)')
    plt.xticks(rotation=45)

    plt.tight_layout()
    plt.savefig('data/rouge_scores_barplot.png')

    # Create boxplots to show distribution of scores (now with all metrics)
    plt.figure(figsize=(18, 12))

    # Create a 2x2 grid for the 4 ROUGE metrics
    metrics = ['rouge1', 'rouge2', 'rougeL', 'rougeLsum']
    metric_names = ['ROUGE-1', 'ROUGE-2', 'ROUGE-L', 'ROUGE-Lsum']

    for idx, metric in enumerate(metrics):
        plt.subplot(2, 2, idx+1)
        
        data = []
        for method in methods:
            data.append(rouge_scores[method][metric])
        
        plt.boxplot(data, labels=methods)
        plt.title(f'Distribution of {metric_names[idx]} Scores')
        plt.ylabel(f'{metric_names[idx]} (F1)')
        plt.grid(axis='y', linestyle='--', alpha=0.7)
        plt.xticks(rotation=45)

    plt.tight_layout()
    plt.savefig('data/rouge_scores_boxplot.png')
    print("ROUGE score charts saved to data directory")
except Exception as e:
    print(f"Error calculating ROUGE scores: {e}")

# Connecting FinBERT
try:
    from transformers import pipeline, AutoTokenizer

    pipe = pipeline("text-classification", model="ProsusAI/finbert")
    input = combined_df.iloc[48]['summary_textrank']
    data = pipe(input)[0]
    print(f"For input => {input}\t\n The predicted sentiments are:")
    print(f"label: {data['label']} | score: {(data['score'])*100:.2f}%")

    # Perform sentiment analysis on the summarized text from the best performing summarized text - refer to ROUGE scores
    # Load the tokenizer associated with the model
    tokenizer = AutoTokenizer.from_pretrained("ProsusAI/finbert")
    combined_df['sentiment'] = 'neutral'
    combined_df['sentiment_score'] = 0.0

    for i in range(len(combined_df)):
        summary_in = combined_df.iloc[i]['summary_textrank']
        
        # Truncate the text to fit within the model's limits (512 tokens)
        encoded_input = tokenizer(summary_in, truncation=True, max_length=512, return_tensors="pt")
        
        try:
            # Use the pipeline with the truncated text
            data = pipe(summary_in, truncation=True, max_length=512)[0]
            print(f"Row {i}: {data['label']} | score: {(data['score'])*100:.2f}%")
            
            combined_df.loc[i, 'sentiment'] = data['label']
            combined_df.loc[i, 'sentiment_score'] = data['score']
        except Exception as e:
            print(f"Error processing row {i}: {e}")
            combined_df.loc[i, 'sentiment'] = 'neutral'
            combined_df.loc[i, 'sentiment_score'] = 0.5

        # Save data to the website's data directory
        combined_df.to_csv("./financial_news_summary_website/data/combined_sentiment.csv", index=False)
        print("Final dataset with sentiment analysis saved to 'data/combined_sentiment.csv'")
    
except Exception as e:
    print(f"Error performing sentiment analysis: {e}")