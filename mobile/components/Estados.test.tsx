import { fireEvent, render, screen } from '@testing-library/react-native';
import { EstadoErro, EstadoVazio } from './Estados';

jest.mock('../hooks/useTema', () => ({
  useTema: () => ({
    texto: '#E8F4F8',
    textoSecundario: '#A9D7EA',
    tinta: '#3EC6FF',
    tintaSobre: '#071016',
    tintaSuave: '#3EC6FF22',
  }),
}));

describe('estados de tela', () => {
  it('mostra a orientação quando a lista vem vazia', async () => {
    await render(<EstadoVazio mensagem="Nenhuma entrada com esse nome nesta categoria." />);
    expect(screen.getByText('Nenhuma entrada com esse nome nesta categoria.')).toBeTruthy();
  });

  it('oferece nova tentativa quando a busca falha', async () => {
    const tentar = jest.fn();
    await render(<EstadoErro mensagem="Sem rede para alcançar o Holocron." onTentar={tentar} />);
    fireEvent.press(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(tentar).toHaveBeenCalledTimes(1);
  });
});
