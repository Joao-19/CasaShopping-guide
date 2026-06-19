#!/usr/bin/env bash
# Reforca o bootstrap definido em CLAUDE.md no inicio de cada sessao.
# Injeta o lembrete via additionalContext do hook SessionStart.
cat <<'JSON'
{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":"Lembrete de bootstrap (CLAUDE.md): para a primeira interacao desta sessao, leia AI_CONTEXT/index.md e apresente o menu de modos (1=VibeCode, 2=Developer, 3=Revisora). Para saudacoes simples, responda naturalmente e DEPOIS ofereca o menu. So inicie a tarefa real apos a escolha do modo."}}
JSON
