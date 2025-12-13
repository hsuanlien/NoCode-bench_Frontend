import json
import requests
from bs4 import BeautifulSoup

def fetch_from_huggingface():
    dataset_urls = ['https://huggingface.co/datasets/NoCode-bench/NoCode-bench_Verified/viewer/default/test', 'https://huggingface.co/datasets/NoCode-bench/NoCode-bench_Verified/viewer/default/test?p=1']
    repo = []
    instance_id = []
    html_url = []
    for url in dataset_urls:
        response = requests.get(url)
        if response.status_code == 200:
            soup = BeautifulSoup(response.content, 'html.parser')
            # print(soup.prettify())
            items = soup.find_all('tr', class_='cursor-pointer space-x-4 divide-x border-b outline-offset-[-2px] odd:bg-gray-50 hover:bg-gray-100 dark:odd:bg-gray-925 dark:hover:bg-gray-850')
            for item in items:
                repo.append(item.find_all('td')[0].text.strip())
                instance_id.append(item.find_all('td')[1].text.strip())
                html_url.append(item.find_all('td')[2].text.strip())
        else:
            raise Exception(f"Failed to fetch data: {response.status_code}")
        
    return repo, instance_id, html_url

def fetch_from_github(url, title, case_number, conversation, commits, checks, files_changed):
    response = requests.get(url)
        
    if response.status_code == 200:
        soup = BeautifulSoup(response.content, 'html.parser')
        # print(soup.prettify())

        title.append(soup.find('bdi').text.strip())
        case_number.append(soup.find('span', class_='f1-light color-fg-muted').text.strip())

        status_bar = soup.find('nav', class_='tabnav-tabs d-flex overflow-auto').find_all('a')
        # print(status_bar.prettify())
        for idx in range(0, 4):
            if idx == 0:
                conversation.append(status_bar[idx].find('span')['title'])
            elif idx == 1:
                commits.append(status_bar[idx].find('span')['title'])
            elif idx == 2:
                checks.append(status_bar[idx].find('span')['title'])
            elif idx == 3:
                if status_bar[idx].find('span'):
                    files_changed.append(status_bar[idx].find('span')['title'])
                else:
                    files_changed.append('')
    else:
        raise Exception(f"Failed to fetch data: {response.status_code}")
    return title, case_number, conversation, commits, checks, files_changed

repo, instance_id, html_url = fetch_from_huggingface()
title, case_number, conversation, commits, checks, files_changed = [], [], [], [], [], []
for idx in range(0, len(html_url)):
    fetch_from_github(html_url[idx], title, case_number, conversation, commits, checks, files_changed)
# print(f"Title: {title[0]}\nCase Number: {case_number[0]}\nRepo: {repo[0]}\nInstance ID: {instance_id[0]}\nURL: {html_url[0]}\nConversation: {conversation[0]}\nCommits: {commits[0]}\nChecks: {checks[0]}\nFiles Changed: {files_changed[0]}")

# -------------------------------------------------------------------------------------------

n = len(instance_id)
assert all(len(lst) == n for lst in [
    repo, title, case_number, html_url, conversation, commits, checks, files_changed
])

tasks = []
for idx in range(n):
    tasks.append({
        "id": idx + 1,
        "instance_id": instance_id[idx],
        "repo": repo[idx],
        "title": title[idx],
        "case_number": case_number[idx],
        "url": html_url[idx],
        "conversation": conversation[idx],
        "commits": commits[idx],
        "checks": checks[idx],
        "files_changed": files_changed[idx],
    })

with open("public/requestOptions.json", "w", encoding="utf-8") as f:
    json.dump({"pullRequests": tasks}, f, ensure_ascii=False, indent=2)
