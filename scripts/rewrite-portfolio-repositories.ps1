$ErrorActionPreference = 'Stop'

$owner = 'Jxino'
$projects = @(
    @{
        Old = 'campus-linker'; New = 'sentinel-ai'; Title = 'Sentinel AI'
        Description = '실시간 네트워크 트래픽에서 침입 징후를 탐지하는 AI 기반 보안 모니터링 플랫폼'
        Topics = @('python', 'pytorch', 'kafka', 'fastapi', 'docker', 'postgresql')
        Summary = 'Sentinel AI analyzes streaming network telemetry and prioritizes suspicious behavior with an explainable anomaly-detection pipeline.'
        Features = @('Streaming packet and flow feature ingestion', 'Behavior-based anomaly scoring', 'Analyst dashboard with explainable alerts', 'Incident evidence export and audit trail')
        Architecture = @('Kafka receives normalized network events.', 'FastAPI exposes alert and investigation APIs.', 'PyTorch inference workers calculate anomaly scores.', 'PostgreSQL stores incidents, evidence, and analyst decisions.')
        Security = @('Signed service-to-service requests', 'Role-based analyst permissions', 'Immutable incident audit records', 'Secrets supplied only through environment variables')
    },
    @{
        Old = 'payflow-api'; New = 'phishing-shield'; Title = 'Phishing Shield'
        Description = 'URL과 이메일 본문을 분석해 피싱 위험도를 판별하는 머신러닝 기반 탐지 서비스'
        Topics = @('python', 'scikit-learn', 'fastapi', 'react', 'redis', 'docker')
        Summary = 'Phishing Shield classifies suspicious URLs and email content, then explains the indicators that contributed to each risk score.'
        Features = @('URL lexical and domain feature extraction', 'Email text classification', 'Human-readable risk explanations', 'Feedback loop for analyst corrections')
        Architecture = @('React provides the investigation workspace.', 'FastAPI validates requests and orchestrates inference.', 'Scikit-learn models score URL and message features.', 'Redis caches recent verdicts and rate-limit state.')
        Security = @('Strict URL and attachment validation', 'Request rate limiting', 'No raw email retention by default', 'Model feedback restricted to authenticated analysts')
    },
    @{
        Old = 'study-orbit'; New = 'deepfake-forensics'; Title = 'Deepfake Forensics'
        Description = '이미지와 영상의 조작 흔적을 탐지하고 분석 근거를 시각화하는 AI 포렌식 도구'
        Topics = @('python', 'pytorch', 'opencv', 'fastapi', 'celery', 'redis')
        Summary = 'Deepfake Forensics detects visual manipulation artifacts and produces frame-level evidence for media verification workflows.'
        Features = @('Frame sampling and face-region analysis', 'Manipulation probability heatmaps', 'Metadata and encoding anomaly checks', 'Downloadable forensic report')
        Architecture = @('FastAPI accepts media analysis jobs.', 'Celery workers process frames asynchronously.', 'OpenCV extracts visual and encoding features.', 'PyTorch models generate frame-level confidence scores.')
        Security = @('Isolated media processing workers', 'Automatic deletion after retention expiry', 'File signature and size validation', 'Hash-based evidence integrity checks')
    },
    @{
        Old = 'log-insight'; New = 'soc-copilot'; Title = 'SOC Copilot'
        Description = '보안 경보를 요약하고 대응 절차를 추천하는 LLM 기반 SOC 분석 보조 시스템'
        Topics = @('python', 'langchain', 'elasticsearch', 'react', 'fastapi', 'docker')
        Summary = 'SOC Copilot correlates security alerts, summarizes evidence, and recommends reviewable incident-response playbooks for analysts.'
        Features = @('Alert correlation across multiple sources', 'Evidence-grounded incident summaries', 'Suggested response playbooks', 'Analyst approval before every action')
        Architecture = @('Elasticsearch stores searchable alert evidence.', 'FastAPI provides incident and assistant endpoints.', 'LangChain assembles retrieval-grounded prompts.', 'React presents citations, confidence, and approval controls.')
        Security = @('Retrieved evidence is cited in every answer', 'Prompt-injection filtering for ingested logs', 'No autonomous remediation actions', 'Complete analyst action audit trail')
    },
    @{
        Old = 'booknest'; New = 'zero-trust-gateway'; Title = 'Zero Trust Gateway'
        Description = '사용자와 기기 신뢰도를 지속 검증하는 정책 기반 제로 트러스트 접근 게이트웨이'
        Topics = @('golang', 'oauth2', 'jwt', 'postgresql', 'redis', 'docker')
        Summary = 'Zero Trust Gateway evaluates identity, device posture, and resource policy before granting short-lived application access.'
        Features = @('Identity-aware reverse proxy', 'Device posture and risk evaluation', 'Policy-based resource authorization', 'Short-lived session and token management')
        Architecture = @('Go handles the policy enforcement proxy.', 'OAuth2 integrates external identity providers.', 'PostgreSQL stores policies and access history.', 'Redis manages short-lived sessions and revocation state.')
        Security = @('Default-deny access policy', 'Short-lived signed JWT credentials', 'Continuous session re-evaluation', 'Administrative changes recorded in audit logs')
    },
    @{
        Old = 'health-mate'; New = 'malware-sandbox'; Title = 'Malware Sandbox'
        Description = '의심 파일을 격리 실행하고 행위 지표를 수집하는 자동화 악성코드 분석 샌드박스'
        Topics = @('python', 'yara', 'rabbitmq', 'docker', 'postgresql', 'fastapi')
        Summary = 'Malware Sandbox performs isolated static and behavioral analysis while preserving indicators for repeatable security investigations.'
        Features = @('Static signature and string inspection', 'Isolated behavioral execution jobs', 'YARA rule matching', 'IOC and analyst report generation')
        Architecture = @('FastAPI receives samples and analysis requests.', 'RabbitMQ distributes isolated analysis jobs.', 'Docker workers execute disposable analysis environments.', 'PostgreSQL stores reports and extracted indicators.')
        Security = @('No direct network path from worker to host', 'Disposable worker environments', 'Sample access limited by role', 'Encrypted evidence storage and integrity hashes')
    },
    @{
        Old = 'market-pulse'; New = 'privacy-guard-ai'; Title = 'Privacy Guard AI'
        Description = '문서 속 개인정보를 자동 탐지하고 마스킹하는 자연어 처리 기반 프라이버시 도구'
        Topics = @('python', 'spacy', 'fastapi', 'react', 'postgresql', 'docker')
        Summary = 'Privacy Guard AI detects personally identifiable information in documents and applies reviewable redaction policies before sharing.'
        Features = @('PII entity detection for structured and free text', 'Configurable masking and tokenization rules', 'Side-by-side redaction review', 'Privacy risk and processing report')
        Architecture = @('React provides document review and approval.', 'FastAPI manages redaction workflows.', 'spaCy pipelines detect sensitive entities.', 'PostgreSQL stores policies and non-sensitive audit metadata.')
        Security = @('Original documents are encrypted at rest', 'Configurable automatic retention expiry', 'Redaction approval separated by role', 'Sensitive text excluded from application logs')
    }
)

$workRoot = Join-Path $PSScriptRoot '.repo-work'
$resolvedScriptRoot = [System.IO.Path]::GetFullPath($PSScriptRoot)
$resolvedWorkRoot = [System.IO.Path]::GetFullPath($workRoot)
if (-not $resolvedWorkRoot.StartsWith($resolvedScriptRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "Unsafe temporary path: $resolvedWorkRoot"
}
if (Test-Path $workRoot) {
    Remove-Item -LiteralPath $workRoot -Recurse -Force
}
New-Item -ItemType Directory -Path $workRoot | Out-Null

try {
    foreach ($project in $projects) {
        Write-Host "Updating $($project.Old) -> $($project.New)"
        $repoPath = Join-Path $workRoot $project.Old
        & gh repo clone "$owner/$($project.Old)" $repoPath -- --quiet
        if ($LASTEXITCODE -ne 0) { throw "Clone failed: $($project.Old)" }

        Push-Location $repoPath
        try {
            & git rm -r --quiet .
            if ($LASTEXITCODE -ne 0) { throw "Unable to clear tracked files: $($project.Old)" }

            New-Item -ItemType Directory -Path 'docs' | Out-Null
            $featureList = ($project.Features | ForEach-Object { "- $_" }) -join "`n"
            $architectureList = ($project.Architecture | ForEach-Object { "1. $_" }) -join "`n"
            $securityList = ($project.Security | ForEach-Object { "- $_" }) -join "`n"
            $techList = ($project.Topics | ForEach-Object { '`{0}`' -f $_ }) -join ' | '

            $readme = @"
# $($project.Title)

$($project.Summary)

> Portfolio concept project focused on practical AI and cybersecurity workflows.

## Core Features

$featureList

## Technology

$techList

## Architecture

$architectureList

## Security Principles

$securityList

## Project Status

This repository contains a portfolio-ready system design and metadata set. The scope is intentionally limited to a demonstrable concept rather than a production deployment.

## License

MIT License
"@

            $metadata = [ordered]@{
                slug = $project.New
                title = $project.Title
                description = $project.Description
                category = 'AI Security'
                technologies = $project.Topics
                features = $project.Features
                repository = "https://github.com/$owner/$($project.New)"
                portfolioVisible = $true
            } | ConvertTo-Json -Depth 8

            $architecture = @"
# Architecture

## Overview

$($project.Summary)

## Data Flow

$architectureList

## Design Goals

- Keep security decisions explainable and reviewable.
- Separate ingestion, analysis, and presentation concerns.
- Preserve evidence integrity without retaining unnecessary sensitive data.
- Allow individual components to scale independently.
"@

            $securityModel = @"
# Security Model

## Controls

$securityList

## Threat Assumptions

- External input is untrusted and must be validated.
- Credentials and secrets never belong in the repository.
- Automated findings require human review before consequential action.
- Logs must support investigation without exposing sensitive payloads.
"@

            $license = @"
MIT License

Copyright (c) 2026 Jinho Kim

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
"@

            Set-Content -LiteralPath 'README.md' -Value $readme -Encoding UTF8
            Set-Content -LiteralPath 'portfolio-project.json' -Value $metadata -Encoding UTF8
            Set-Content -LiteralPath 'docs\architecture.md' -Value $architecture -Encoding UTF8
            Set-Content -LiteralPath 'docs\security-model.md' -Value $securityModel -Encoding UTF8
            Set-Content -LiteralPath 'LICENSE' -Value $license -Encoding UTF8

            & git add --all
            & git commit -m "Rebuild portfolio project as $($project.Title)" --quiet
            if ($LASTEXITCODE -ne 0) { throw "Commit failed: $($project.Old)" }
            & git push origin HEAD:main --quiet
            if ($LASTEXITCODE -ne 0) { throw "Push failed: $($project.Old)" }
        }
        finally {
            Pop-Location
        }

        & gh api -X PATCH "repos/$owner/$($project.Old)" -f "name=$($project.New)" -f "description=$($project.Description)" -f 'homepage=' | Out-Null
        if ($LASTEXITCODE -ne 0) { throw "Rename failed: $($project.Old)" }

        $topicArguments = @('api', '-X', 'PUT', "repos/$owner/$($project.New)/topics")
        foreach ($topic in $project.Topics) {
            $topicArguments += @('-f', "names[]=$topic")
        }
        & gh @topicArguments | Out-Null
        if ($LASTEXITCODE -ne 0) { throw "Topic update failed: $($project.New)" }
    }
}
finally {
    if (Test-Path $workRoot) {
        $finalWorkRoot = [System.IO.Path]::GetFullPath($workRoot)
        if ($finalWorkRoot.StartsWith($resolvedScriptRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
            Remove-Item -LiteralPath $workRoot -Recurse -Force
        }
    }
}

Write-Host 'All portfolio repositories were updated.'
