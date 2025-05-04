import express from "express";
import http from 'http';
import url, {URLSearchParams} from 'url';

const porta = 3000;
const host = 'localhost';
const app = express();


app.use(express.urlencoded({ extended: true }));

app.get("/", (requisicao, resposta) => {
    if (requisicao.method==="GET"){
        const dados = new URLSearchParams(url.parse(requisicao.url).query);
        const idade = parseInt(dados.get('idade'));
        const sexo = dados.get('sexo')?.toUpperCase();
        const salarioBase = parseFloat(dados.get('salario_base'));
        const anoContratacao = parseInt(dados.get('anoContratacao'));
        const matricula = parseInt(dados.get('matricula'));

        const anoAtual = new Date().getFullYear();
        const tempoEmpresa = anoAtual - anoContratacao;
        const anoNascimento = anoAtual - idade;
        const idadeNaContratacao = anoContratacao - anoNascimento;

    // Validaçoes
    const erros = [];
    if (isNaN(idade)) 
    erros.push("Idade inválida.");
    if (idade <= 16) 
    erros.push("Idade deve ser maior que 16.");
    if (isNaN(salarioBase)) 
    erros.push("Salário base inválido.");
    if (isNaN(anoContratacao))
    erros.push("Ano de contratação inválido.");
    if (anoContratacao <= 1960)
    erros.push("Ano de contratação deve ser depois de 1960.");
    if (isNaN(matricula) || matricula <= 0) 
    erros.push("Matrícula inválida.");
    if (sexo !== 'M' && sexo !== 'F') 
    erros.push("Sexo deve ser 'M' ou 'F'.");
    if(idade<tempoEmpresa)
    erros.push("Idade menor que tempo de empresa");
    if (idadeNaContratacao <= 16)
    erros.push("Funcionário foi contratado com 16 anos ou menos.");
    if (anoContratacao > anoAtual) 
    erros.push("Ano de contratação maior que o ano atual.");
    if (idade > 99) 
    erros.push("Idade muito alta.");
    
    
    if (erros.length > 0) {
        resposta.send(`
            <html>
            <head>
                <meta charset="utf-8">
                <title>Erro</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f2f2f2;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                    }
                    .documento {
                        background-color: white;
                        padding: 30px;
                        border: 2px solid #ccc;
                        border-radius: 10px;
                        box-shadow: 0 0 15px rgba(0,0,0,0.1);
                        width: 500px;
                    }
                    h2 {
                        color: red;
                        border-bottom: 2px solid #eee;
                        padding-bottom: 10px;
                    }
                    ul {
                        padding-left: 20px;
                    }
                    li {
                        margin-bottom: 8px;
                        border-bottom: 1px solid #ddd;
                        padding-bottom: 4px;
                    }
                </style>
            </head>
            <body>
                <div class="documento">
                    <h2>Não foi possível calcular o reajuste</h2>
                    <ul>${erros.map(e => `<li>${e}</li>`).join('')}</ul>
                </div>
            </body>
            </html>
        `);
        return;
    }
    

    // Calculo do reajuste
    let reajuste = 0;
    let ajusteFixo = 0;

    if (idade >= 18 && idade <= 39) {
        if (sexo === 'M') {
            reajuste = 0.10;
            if (tempoEmpresa > 10) {
                ajusteFixo = 17;
            } else {
                ajusteFixo = -10;
            }
        } else {
            reajuste = 0.08;
            if (tempoEmpresa > 10) {
                ajusteFixo = 16;
            } else {
                ajusteFixo = -11;
            }
        }
    } else if (idade >= 40 && idade <= 69) {
        if (sexo === 'M') {
            reajuste = 0.08;
            if (tempoEmpresa > 10) {
                ajusteFixo = 15;
            } else {
                ajusteFixo = -5;
            }
        } else {
            reajuste = 0.10;
            if (tempoEmpresa > 10) {
                ajusteFixo = 14;
            } else {
                ajusteFixo = -7;
            }
        }
    } else if (idade >= 70 && idade <= 99) {
        if (sexo === 'M') {
            reajuste = 0.15;
            if (tempoEmpresa > 10) {
                ajusteFixo = 13;
            } else {
                ajusteFixo = -15;
            }
        } else {
            reajuste = 0.17;
            if (tempoEmpresa > 10) {
                ajusteFixo = 12;
            } else {
                ajusteFixo = -17;
            }
        }
    }
    

    const salarioFinal = (salarioBase * (1 + reajuste)) + ajusteFixo;

    resposta.send(`
    <html>
    <head>
        <meta charset="utf-8">
        <title>Resultado</title>
        <style>
            body {
                background-color: #f0f0f0;
                font-family: Arial, sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
            }
            .documento {
                background: white;
                padding: 30px;
                border: 1px solid #ccc;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
                border-radius: 8px;
                width: 400px;
            }
            h1 {
                text-align: center;
            }
            h2 {
                color: green;
                border: 2px solid green;
                padding: 10px;
                box-shadow: 0 0 10px rgba(0, 128, 0, 0.4);
                border-radius: 6px;
                text-align: center;
                margin-top: 20px;
            }
            p {
                margin: 10px 0 5px;
            }
            hr {
                border: none;
                border-bottom: 1px solid #ccc;
                margin: 5px 0 15px;
            }
        </style>
    </head>
    <body>
        <div class="documento">
            <h1>Reajuste Salarial</h1>
            <p><strong>Matrícula:</strong> ${matricula}</p><hr>
            <p><strong>Idade:</strong> ${idade}</p><hr>
            <p><strong>Sexo:</strong> ${sexo}</p><hr>
            <p><strong>Salário Base:</strong> R$ ${salarioBase.toFixed(2)}</p><hr>
            <p><strong>Ano de Contratação:</strong> ${anoContratacao}</p><hr>
            <p><strong>Tempo de Empresa:</strong> ${tempoEmpresa} anos</p><hr>
            <h2>Salário Reajustado: R$ ${salarioFinal.toFixed(2)}</h2>
        </div>
    </body>
    </html>
`);


    }
});



const servidor = http.createServer(app);

servidor.listen(porta, host, () => {
    console.log(`Servidor escutando em http://${host}:${porta}`);
});

export default app;