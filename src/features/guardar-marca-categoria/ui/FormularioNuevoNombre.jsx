import { useState } from 'react';
import { Boton, Campo, Icono } from '@/shared/ui';
import { useGuardarMarcaCategoria } from '../model/useGuardarMarcaCategoria';
import { TEXTOS } from './textos';
import styles from './FormularioNuevoNombre.module.css';

/** Fila "Nueva marca" + "+ Agregar" de la vista 5.4. */
export function FormularioNuevoNombre({ tipo, alAgregar }) {
  const { mutate, isPending, error, reset } = useGuardarMarcaCategoria(tipo);
  const [nombre, setNombre] = useState('');
  const [vacio, setVacio] = useState(false);

  const agregar = (e) => {
    e.preventDefault();
    if (!nombre.trim()) {
      setVacio(true);
      return;
    }
    mutate(
      { nombre: nombre.trim() },
      {
        onSuccess: (creado) => {
          setNombre('');
          alAgregar?.(creado);
        },
      },
    );
  };

  return (
    <form className={styles.fila} onSubmit={agregar} noValidate>
      <Campo
        className={styles.campo}
        aria-label={TEXTOS[tipo].nueva}
        placeholder={TEXTOS[tipo].nueva}
        value={nombre}
        maxLength={80}
        onChange={(e) => {
          setNombre(e.target.value);
          setVacio(false);
          if (error) reset();
        }}
        error={vacio ? 'Escribe un nombre' : error?.message}
      />
      <Boton type="submit" cargando={isPending}>
        <Icono nombre="mas" tamano={18} /> Agregar
      </Boton>
    </form>
  );
}
