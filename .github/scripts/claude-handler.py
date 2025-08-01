#!/usr/bin/env python3
"""
Claude Code GitHub Actions Handler
Processes @claude requests from GitHub Issues and executes them
"""

import os
import sys
import json
import subprocess
import tempfile
from pathlib import Path

def send_to_claude_api(request_text, project_context=""):
    """
    Send request to Claude API and get response
    """
    import requests
    
    api_key = os.environ.get('ANTHROPIC_API_KEY')
    if not api_key:
        raise ValueError("ANTHROPIC_API_KEY not found in environment")
    
    # Lese CLAUDE.md für Projektkontext
    claude_md_path = Path('CLAUDE.md')
    if claude_md_path.exists():
        with open(claude_md_path, 'r', encoding='utf-8') as f:
            project_context = f.read()
    
    # Erstelle System-Prompt mit Projektkontext
    system_prompt = f"""You are Claude Code, helping with a Pokemon Trainer Manager project.

Project Context:
{project_context}

You are working in a GitHub Actions environment. When you make changes:
1. Only edit existing files or create necessary new files
2. Follow the project's TypeScript and React conventions
3. Use pnpm as the package manager
4. Ensure all changes are compatible with the existing codebase

Current task: {request_text}

Please provide specific file changes needed. Format your response as actionable instructions."""

    headers = {
        'Content-Type': 'application/json',
        'x-api-key': api_key,
        'anthropic-version': '2023-06-01'
    }
    
    payload = {
        'model': 'claude-3-sonnet-20240229',
        'max_tokens': 4000,
        'messages': [
            {
                'role': 'user',
                'content': request_text
            }
        ],
        'system': system_prompt
    }
    
    response = requests.post(
        'https://api.anthropic.com/v1/messages',
        headers=headers,
        json=payload,
        timeout=60
    )
    
    if response.status_code != 200:
        raise Exception(f"Claude API error: {response.status_code} - {response.text}")
    
    return response.json()['content'][0]['text']

def execute_claude_response(claude_response, issue_number):
    """
    Analyze Claude's response and execute any code changes
    """
    print(f"Claude Response:\n{claude_response}")
    
    # Für jetzt erstellen wir einen einfachen Kommentar mit der Antwort
    # Später können wir hier komplexere Logik hinzufügen, um Code-Änderungen zu parsen
    
    # Erstelle Kommentar mit Claude's Antwort
    comment_body = f"""🤖 **Claude Code Response**

{claude_response}

---
*Executed via GitHub Actions*"""
    
    # Verwende gh CLI um zu kommentieren
    subprocess.run([
        'gh', 'issue', 'comment', str(issue_number),
        '--body', comment_body
    ], check=True)
    
    return True

def main():
    """
    Main handler function
    """
    try:
        # Hole Parameter aus Umgebungsvariablen
        request_text = os.environ.get('CLAUDE_REQUEST', '')
        issue_number = os.environ.get('ISSUE_NUMBER', '')
        
        if not request_text:
            print("No Claude request found")
            return
        
        if not issue_number:
            print("No issue number found")
            return
        
        print(f"Processing request: {request_text}")
        print(f"Issue number: {issue_number}")
        
        # Sende Anfrage an Claude API
        claude_response = send_to_claude_api(request_text)
        
        # Führe Claude's Antwort aus
        execute_claude_response(claude_response, issue_number)
        
        print("Claude request processed successfully")
        
    except Exception as e:
        print(f"Error processing Claude request: {str(e)}")
        
        # Erstelle Fehler-Kommentar
        error_comment = f"""❌ **Claude Code Error**

Es gab einen Fehler bei der Verarbeitung der Anfrage:

```
{str(e)}
```

Bitte versuche es erneut oder kontaktiere einen Administrator."""
        
        try:
            subprocess.run([
                'gh', 'issue', 'comment', os.environ.get('ISSUE_NUMBER', ''),
                '--body', error_comment
            ], check=True)
        except:
            pass
        
        sys.exit(1)

if __name__ == '__main__':
    main()