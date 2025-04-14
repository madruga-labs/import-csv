# Importador CSV para Supabase

Script simples para importação de dados meteorológicos de arquivos CSV para o Supabase.

## Configuração

1. Clone este repositório
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Crie um arquivo `.env` com as credenciais do Supabase:
   ```
   SUPABASE_URL=sua_url_do_supabase
   SUPABASE_KEY=sua_chave_do_supabase
   ```
4. Coloque seu arquivo CSV de dados meteorológicos na raiz do projeto com o nome `data.csv`

## Uso

Execute o script com:

```bash
npm start
```

ou

```bash
node importCSV.js
```

O script irá:
1. Contar as linhas do arquivo CSV para configurar a barra de progresso
2. Processar cada linha, formatando os dados para o formato esperado pelo Supabase
3. Inserir cada linha na tabela `weather_data`
4. Exibir o progresso da importação e estimar o tempo restante

## Formato do CSV esperado

O script espera um arquivo CSV com as seguintes colunas:

- `DATA (YYYY-MM-DD)`: Data da medição
- `Hora UTC`: Hora da medição
- `PRECIPITAÇÃO TOTAL, HORÁRIO (mm)`: Precipitação em milímetros
- `RADIACAO GLOBAL (KJ/m²)`: Radiação global
- `TEMPERATURA DO AR - BULBO SECO, HORARIA (°C)`: Temperatura média
- `TEMPERATURA MÁXIMA NA HORA ANT. (AUT) (°C)`: Temperatura máxima
- `TEMPERATURA MÍNIMA NA HORA ANT. (AUT) (°C)`: Temperatura mínima
- `UMIDADE RELATIVA DO AR, HORARIA (%)`: Umidade média
- `UMIDADE REL. MAX. NA HORA ANT. (AUT) (%)`: Umidade máxima 
- `UMIDADE REL. MIN. NA HORA ANT. (AUT) (%)`: Umidade mínima
- `VENTO, RAJADA MAXIMA (m/s)`: Velocidade máxima do vento
- `VENTO, VELOCIDADE HORARIA (m/s)`: Velocidade média do vento
- `ESTACAO`: Código da estação

## Estrutura da Tabela no Supabase

Os dados são importados para uma tabela `weather_data` com a seguinte estrutura:

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid | Identificador único |
| station_code | text | Código da estação |
| date | date | Data da medição |
| time | time | Hora da medição |
| rain_max | double precision | Precipitação máxima |
| rad_max | double precision | Radiação máxima |
| temp_avg | double precision | Temperatura média |
| temp_max | double precision | Temperatura máxima |
| temp_min | double precision | Temperatura mínima |
| hum_avg | double precision | Umidade média |
| hum_max | double precision | Umidade máxima |
| hum_min | double precision | Umidade mínima |
| wind_max | double precision | Velocidade máxima do vento |
| wind_avg | double precision | Velocidade média do vento |
| created_at | timestamp with time zone | Data de criação do registro |

## Desenvolvimento

### Testes

Para executar os testes:

```bash
npm test
```

Os testes verificam a formatação correta de segundos para exibição do tempo estimado. Testes adicionais para outras funcionalidades podem ser implementados conforme necessário.

Para executar testes com cobertura:

```bash
npm run test:coverage
``` 