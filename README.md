# ALMA-STUDIO

## Mémoire persistante de l'agent (agentmemory)

Le dépôt déclare le serveur MCP
[agentmemory](https://github.com/rohitg00/agentmemory) dans `.mcp.json` : un
agent de code ouvert sur ce projet retrouve le contexte des sessions
précédentes au lieu de tout redemander à chaque fois.

```bash
npx -y @agentmemory/agentmemory@latest        # démarre le serveur local
npx -y @agentmemory/agentmemory@latest status # santé, mémoires, visionneuse
```

Le serveur tourne uniquement en local — API REST sur `http://localhost:3111`,
visionneuse sur `http://localhost:3113` — sans clé API ni service externe : la
recherche se fait en BM25 et les mémoires restent sur la machine. `.mcp.json`
ne fait que pointer vers ce port ; si le serveur n'est pas démarré, l'agent
fonctionne normalement, simplement sans mémoire.
