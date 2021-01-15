import axios from "axios";
import { MouseEvent, useEffect, useState } from "react";
import { Button, Checkbox, Select } from 'antd';
import { CheckboxChangeEvent } from "antd/lib/checkbox";
import './MainComponent.css';

interface Name {
  id: number,
  name: string
}

interface MySelect {
  key: number,
  value: string
}

export function MainComponent() {
  const defaultValue = '-- None --';
  const [names, setNames] = useState<Name[]>([]);
  const [selects, setSelects] = useState<MySelect[]>([{ key: 0, value: defaultValue }, { key: 1, value: defaultValue }]);
  const [codename, setCodename] = useState<string>('');
  const letters = Array(26).fill('').map((_, i) => String.fromCharCode(i + 65));
  const [startsWithLetter, setStartsWithLetter] = useState<boolean>(false);
  const [selectedLetter, setSelectedLetter] = useState<string>('A');

  useEffect(() => {
    axios.get('http://localhost:3000/names/')
      .then(res => setNames(res.data))
      .catch(res => alert('Cannot fetch data'));
  }, []);

  const handleNameSelectChange = (value: string, key: number) => {
    setSelects(prevState => {
      const select = prevState.find((elem) => elem.key === key);
      if (!select) {
        const select = { key, value };
        return { ...prevState, select };
      }
      select.value = value;
      return prevState;
    });
  };

  const handleGenerateCodename = () => {
    let result = ''
    let filter = ''
    if (startsWithLetter) {
      filter = `?startswith=${selectedLetter}`
    }

    selects.map(async (elem: MySelect) => {
      const name = names.find(e => e.name === elem.value);
      if (name) {
        let url = `http://localhost:3000/names/${name.id}/random/${filter}`
        await axios.get(url)
          .then(res => {
            result += ' ' + res.data.name;
            setCodename(result);
          })
          .catch(res => {
            setCodename(result);
          });
      }
    });
  };

  const handleAddSelect = () => {
    setSelects(prevState => {
      let maxKey = 0;
      prevState.map((elem) => {
        if (elem.key > maxKey) {
          maxKey = elem.key;
        }
        return elem;
      });
      const select = { key: maxKey + 1, value: defaultValue };
      return [...prevState, select];
    })
  };

  const handleDeleteSelect = (e: MouseEvent, key: number) => {
    setSelects(prevState => {
      return prevState.filter((elem) => elem.key !== key)
    });
  }

  const handleInputChange = (e: CheckboxChangeEvent) => {
    setStartsWithLetter((e.target as any).checked);
  }

  const handleLetterSelectChange = (value: string) => {
    setSelectedLetter(value);
  }

  return (
    <div>
      <p className='title row'>Codename Generator</p>

      <div className='select-group row'>
        {
          ([...selects]).reverse().map((sel: MySelect) =>
            <div className='single-select-group'>
              <div className='select'>
                <Select key={sel.key} defaultValue={sel.value} onChange={value => handleNameSelectChange(value, sel.key)}>
                  {[{ id: -1, name: defaultValue }, ...names].map(
                    (elem: Name) => <option key={elem.id} value={elem.name}>{elem.name}</option>)}
                </Select>
              </div>
              <Button className='delete-button' onClick={(e) => handleDeleteSelect(e, sel.key)}>X</Button>
            </div>
          )
        }
      </div>

      <Button className='add-button row' onClick={handleAddSelect}>Add field</Button>

      <div className='options-group row'>
        <label>Start with letter:</label>
        {/* <input
          name="startswith"
          type="checkbox"
          checked={startsWithLetter}
          onChange={handleInputChange}
        />
  */}
        <Checkbox
          className='checkbox'
          checked={startsWithLetter}
          onChange={handleInputChange}
        />
        <div className='select'>
          <Select className='select' defaultValue={selectedLetter} onChange={handleLetterSelectChange}>{letters.map((letter) => <option value={letter}>{letter}</option>)}</Select>
        </div>
      </div>

      <Button className='generate-button row' onClick={handleGenerateCodename}>Generate</Button>

      <p className='result row'>{codename}</p>

    </div>
  );
}