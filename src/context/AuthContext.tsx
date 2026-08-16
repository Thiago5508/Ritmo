import React, { createContext, useContext, useState } from "react";

export interface User {
  id: number;
  nome: string;
  isProfessor: boolean;
  nivel: "sem_nivel" | "iniciante" | "intermediario" | "avancado";
  notificacoes: number;
  telefone: string;
  senha: string;
}

export interface Aluno {
  id: number;
  nome: string;
  nivel: "Sem nível" | "Iniciante" | "Intermediário" | "Avançado";
  foto: string | null;
  telefone: string;
}

interface AuthContextData {
  user: User | null;
  alunos: Aluno[];
  login: (telefone: string, senha: string) => boolean;
  logout: () => void;
  cadastrarAluno: (novoUsuario: User, alunoVisual: Aluno) => void;
}

const USUARIOS: User[] = [
  {
    id: 1,
    nome: "Professor Pulsação",
    isProfessor: true,
    nivel: "avancado",
    notificacoes: 0,
    telefone: "79999999999",
    senha: "admin123",
  },
];

const INITIAL_ALUNOS: Aluno[] = [
  { id: 1, nome: "João Paulo Correia Santos", nivel: "Iniciante", foto: null, telefone: "" },
  { id: 2, nome: "Anna Luiza Souza", nivel: "Intermediário", foto: null, telefone: "" },
  { id: 3, nome: "Wagner Alves Pereira", nivel: "Avançado", foto: null, telefone: "" },
  { id: 4, nome: "Júlio Quaresma Mendonça", nivel: "Iniciante", foto: null, telefone: "" },
  { id: 5, nome: "Daiane Alencar Vianna", nivel: "Intermediário", foto: null, telefone: "" },
  { id: 6, nome: "Hebert Aguiar Feitosa", nivel: "Avançado", foto: null, telefone: "" },
  { id: 7, nome: "Lucas Andrade Santos", nivel: "Iniciante", foto: null, telefone: "" },
  { id: 8, nome: "Sthephanie Lourenço Neves", nivel: "Intermediário", foto: null, telefone: "" },
  { id: 9, nome: "Raíssa Fernanda Lima", nivel: "Iniciante", foto: null, telefone: "" },
  { id: 10, nome: "Edilson Couto Garcia", nivel: "Avançado", foto: null, telefone: "" },
  { id: 11, nome: "Heric Brito Souza", nivel: "Intermediário", foto: null, telefone: "" },
];

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [usuarios, setUsuarios] = useState<User[]>(USUARIOS);
  const [alunos, setAlunos] = useState<Aluno[]>(INITIAL_ALUNOS);

  const login = (telefone: string, senha: string): boolean => {
    const encontrado = usuarios.find(
      (u) => u.telefone === telefone && u.senha === senha
    );
    if (encontrado) {
      setUser(encontrado);
      return true;
    }
    return false;
  };

  const logout = () => setUser(null);

  const cadastrarAluno = (novoUsuario: User, alunoVisual: Aluno) => {
    setUsuarios((prev) => [...prev, novoUsuario]);
    setAlunos((prev) => [...prev, alunoVisual]);
  };

  return (
    <AuthContext.Provider value={{ user, alunos, login, logout, cadastrarAluno }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}