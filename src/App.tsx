import { MantineProvider } from '@mantine/core';
import OrderForm from './component/Products/product.tsx';

function App() {

  return (
    <>
      <MantineProvider>
        <OrderForm />
      </MantineProvider>
    </>
  )
}

export default App;