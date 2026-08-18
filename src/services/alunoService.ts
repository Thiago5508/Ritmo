const API_URL = "https://sua-api.com"; // <- futura URL da sua API Node.js

export async function buscarAlunos() {
  const response = await fetch(`${API_URL}/alunos`);
  return response.json();
}

export async function cadastrarAlunoAPI(aluno: object) {
  const response = await fetch(`${API_URL}/alunos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(aluno),
  });
  return response.json();
}