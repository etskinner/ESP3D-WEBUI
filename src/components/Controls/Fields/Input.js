/*
 Input.js - ESP3D WebUI component file

 Copyright (c) 2021 Alexandre Aussourd. All rights reserved.
 Modified by Luc LEBOSSE 2021

 This code is free software; you can redistribute it and/or
 modify it under the terms of the GNU Lesser General Public
 License as published by the Free Software Foundation; either
 version 2.1 of the License, or (at your option) any later version.
 This code is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 Lesser General Public License for more details.
 You should have received a copy of the GNU Lesser General Public
 License along with This code; if not, write to the Free Software
 Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
*/

import { h } from "preact";
import { useRef, useState, useEffect } from "preact/hooks";
import { Eye, EyeOff } from "preact-feather";

const Reveal = ({ applyTo }) => {
  const [reveal, setReveal] = useState(false);
  const clickReveal = () => {
    setReveal(!reveal);
    //note: reveal is not yet updated so need to upside down compare to use effect
    applyTo.current.type = reveal ? "password" : "text";
  };
  useEffect(() => {
    //for consistency in case of redraw
    applyTo.current.type = reveal ? "text" : "password";
  }, []);
  return (
    <div class="form-icon passwordReveal" onCLick={clickReveal}>
      {reveal ? (
        <EyeOff size="1rem" class="has-error" style="margin-top:0.15rem" />
      ) : (
        <Eye size="1rem" class="has-error" style="margin-top:0.15rem" />
      )}
    </div>
  );
};

const Input = ({
  label = "",
  type = "text",
  id = "",
  value = "",
  setValue,
  ...rest
}) => {
  const inputref = useRef();
  const onInput = (e) => {
    if (setValue) {
      setValue(e.target.value);
    }
  };

  const props = {
    type,
    id,
    name: id,
    value,
  };
  useEffect(() => {
    //to update state
    if (setValue) setValue(value);
  }, []);
  if (type === "password")
    return (
      <div class="has-icon-right" {...rest}>
        <input
          ref={inputref}
          class="form-input"
          {...props}
          placeholder=""
          {...rest}
          onInput={onInput}
        />
        <Reveal applyTo={inputref} />
      </div>
    );
  else
    return (
      <input
        class="form-input"
        {...props}
        placeholder=""
        {...rest}
        onInput={onInput}
      />
    );
};

export default Input;