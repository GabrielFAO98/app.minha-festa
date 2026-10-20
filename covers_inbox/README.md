# Inbox de Novas Capas

Coloque aqui os arquivos de imagem brutos (PNG do Canva, JPGs ou fotos) que você deseja transformar em capas de cilindro.

### Como processar automaticamente:

#### Opção 1: Via terminal (Script 1-clique)
```bash
npm run add-covers -- --theme="Safari Baby" --names="Girafinha, Leãozinho, Zebrinha"
```
*(Ou apenas `npm run add-covers` para processamento com nomes padrão)*

#### Opção 2: Pelo Chat
Basta me avisar:
> *"Processe as capas do inbox com o tema Safari Baby"*

O script cuida automaticamente de:
1. Aparar bordas transparentes vazias (corte automático do cilindro).
2. Otimizar e comprimir em WebP de alta qualidade (redução de até 90% do tamanho).
3. Cadastrar as capas no catálogo do estúdio (`DEFAULT_THEME_COVERS`).
4. Mover as originais para a pasta `_processados/`.

