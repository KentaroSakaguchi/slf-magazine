import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Ajax, GetAjax, SetAjax } from '../Ajax/Ajax';
import EditHeaderRender from './component/EditHeaderRender';
import EditTextRender from './component/EditTextRender';

import EditInput from './component/EditInput';
import EditSelectInput from './component/EditSelectInput';
import EditSelectLang from './component/EditSelectLang';


/**
 * Editページの処理
 */
class Edit extends Component {

  constructor(props) {

    super(props);

    this.titleValueChange = this.titleValueChange.bind(this);
    this.textValueChange = this.textValueChange.bind(this);
    this.selectValueChange = this.selectValueChange.bind(this);
    this.textLangValueChange = this.textLangValueChange.bind(this);
    this.selectValueChangeLang = this.selectValueChangeLang.bind(this);
    this.addInput = this.addInput.bind(this);
    this.addTextRender = this.addTextRender.bind(this);
    this.textValueChangeRemove = this.textValueChangeRemove.bind(this);
    this.editClose = this.editClose.bind(this);
    this.onRec = this.onRec.bind(this);
    this.cancel = this.cancel.bind(this);

    this.selectValueList = [
      { value: 'h3', text: '中見出し' },
      { value: 'h4', text: '小見出し' },
      { value: 'p', text: '文言' },
      { value: 'code', text: 'コード' },
      { value: 'cmd', text: 'コマンド' },
      { value: 'img', text: '画像' }
    ];

    // headerの言語ジャンルの取得
    const langListHtml = document.getElementsByClassName('js-header-trigger');
    const langListHtmlNode = Array.prototype.slice.call(langListHtml);
    this.langList = langListHtmlNode.map((value) => {
      return value.getAttribute('data-lang');
    })

    this.textArray = []; // テキストを格納する配列
    this.selectArray = [this.selectValueList[0].value]; // セレクト(見出しやコードなど)を格納する配列
    this.addTextArray = [0]; // テキストフォームの数

    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    this.state = {
      pageTitle: '',
      textValue: this.textArray,
      selectValue: this.selectArray,
      textLangValue: '',
      selectLangValue: this.langList[0],
      input: 0, // 記事のファイル名
      activeClass: '',
      submitClass: '',
      time: `${year}.${month}.${day}`
    };

    this.addFlg = false;

    // 再編集の場合はajaxでjsonを取得し各種値をsetする
    const locationSearch = location.search;
    if (locationSearch.match(/id=/)) {
      Ajax('/record/report/onepage');
      SetAjax(locationSearch);
      GetAjax().then((result) => {
        console.log(result.data[0])

        // 配列を一旦初期化
        this.selectArray.length = 0;
        this.textArray.length = 0;

        Object.keys(result.data[0].json).forEach((value, index) => {
          if (value.match(/inputId/)) {
            if (value.match(/selectinputId/)) {
              this.selectArray.push(result.data[0].json[value]);
              this.addTextArray.push(index);
            } else {
              this.textArray.push(result.data[0].json[value]);
            }
          }
        });

        this.addTextArray.push(result.data[0].length);

        this.setState({
          pageTitle: result.data[0].title,
          selectLangValue: result.data[0].lang,
          textLangValue: result.data[0].word,
          time: result.data[0].time,
          textValue: this.textArray,
          selectValue: this.selectArray,
          input: result.data[0].length
        });

        this.addTextArray.push(this.state.input);

      });
    }

    // 改行を入力でsubmitさせない
    document.addEventListener('keydown', (event) => {
      const submitKeyCode = 13;
      const keyName = event.keyCode;
      if (keyName === submitKeyCode) {
        event.preventDefault();
      }
    });
  }

  /**
   * titleの変更
   */
  titleValueChange(value) {
    this.setState({ pageTitle: value} );
  }

  /**
   * textの変更
   */
  textValueChange(value, valueId) {
    this.textArray[valueId] = value;
    this.setState({ textValue: this.textArray } );
  }

  /**
   * 言語のテキストの変更
   */
  textLangValueChange(value) {
    this.setState({ textLangValue: value} );
  }

  /**
   * select(見出しやコードなど)の変更
   */
  selectValueChange(value, valueId) {
    this.selectArray[valueId] = value;
    this.setState({ selectValue: this.selectArray} );
  }

  /**
   * 言語のselectの変更
   */
  selectValueChangeLang(value) {
    this.setState({ selectLangValue: value} );
  }

  /**
   * 入力の複製
   */
  addInput() {
    this.setState({ input: this.state.input + 1 });
    this.addFlg = true;
  }

  /**
   * フォーム, 文言の複製
   */
  addTextRender() {

    if (this.addFlg) {
      this.addTextArray.push(this.state.input);
    }

    console.log("this.addTextArray");
    console.log(this.addTextArray);

    return this.addTextArray.map((_value, _index) => (
      this.addFlg = false,
      console.log(this.state.textValue[_index]),
      <div className="blocks__text-wrapper" key={_index}>
        <EditTextRender
          textId={`inputTextId-${_index}`}
          textValue={this.state.textValue[_index]}
          selectValue={this.state.selectValue[_index]}
          selectValueList={this.selectValueList}
        />
        <EditSelectInput
          textId={`inputId${_index}`}
          textValue={this.state.textValue[_index]}
          textValueChange={this.textValueChange}
          selectValueList={this.selectValueList}
          selectValue={this.selectValueChange}
          selectedValue={this.state.selectValue[_index]}
          valueRemove={this.textValueChangeRemove}
        />
      </div>
    ));
  }

  /**
   * 入力の削除
   */
  textValueChangeRemove(removeId) {

    this.textArray.splice(removeId, 1);
    this.addTextArray.pop();

    this.setState({
      input: this.state.input - 1,
      textValue: this.textArray,
    });
  }

  /**
   * edit項目を非表示に
   */
  editClose() {
    if (this.state.activeClass !== 'is-hide') {
      this.setState({ activeClass: 'is-hide'});
    } else {
      this.setState({ activeClass: ''});
    }
  }

  /**
   * 記録ボタン(hidenにvalueをset)
   */
  onRec() {
    const saveTarget = document.getElementsByClassName('blocks');
    const saveHtml = saveTarget[0].outerHTML.replace(/class="blocks display/, 'class="blocks is-display');
    const saveHtmlSet = document.getElementById('js-saveHtml');
    saveHtmlSet.setAttribute('value', saveHtml);

    if (this.state.submitClass !== 'is-show') {
      this.setState({ submitClass: 'is-show'});
    }
  }

  cancel() {
    if (this.state.submitClass === 'is-show') {
      this.setState({ submitClass: ''});
    }
  }

  render() {
    console.log('!');
    return(
      <div className="edit-wrapper">
        <input type="hidden" name="delete" value="false" />
        <input type="hidden" name="save" id="js-saveHtml"/>
        <section className={`blocks display ${this.state.activeClass}`}>
          <div className="blocks__box">
            <div className="blocks__inner">
              <header className="blocks__header">
                <div className="blocks__title-wrapper">
                  <EditHeaderRender
                    headerValue={this.state.pageTitle}
                  />
                  <EditInput
                    headerValue={this.state.pageTitle}
                    headerValueChange={this.titleValueChange}
                  />
                </div>
                <div className="blocks__lang-wrapper">
                  <EditSelectLang
                    textLangValue={this.state.textLangValue}
                    textLangValueChange={this.textLangValueChange}
                    selectLangList={this.langList}
                    selectLangValue={this.state.selectLangValue}
                    selectLangValueChange={this.selectValueChangeLang}
                  />
                </div>
              </header>
              <section className="blocks__text">
                <div className="blocks__time">
                  <p>{this.state.time}</p>
                  <input type="hidden" name="time" value={this.state.time} />
                </div>
                { this.addTextRender() }
              </section>
            </div>
          </div>
        </section>

        <div className={`edit ${this.state.activeClass}`}>
          
          <div className="edit__button-wrapper">
            <button
              type="button"
              className="edit__button edit__button--close"
              onClick={this.editClose}>
            </button>
            <button
              type="button"
              className="edit__button edit__button--plus"
              onClick={this.addInput}>
            </button>
            <button
              type="button"
              className="edit__button edit__button--rec"
              onClick={this.onRec}>
            </button>
          </div>
          <div className={`edit__button-wrapper edit__button-wrapper--submit ${this.state.submitClass}`}>
            <div className="button-wrapper">
              <button
                type="submit"
                className="button button--submit">
                SUBMIT
              </button>
              <button
                type="button"
                className="button button--ng"
                onClick={this.cancel}>
                CANCEL
              </button>
            </div>
          </div>
        </div>

      </div>
    );
  }

}

Edit.propTypes = {
  pageTitle: PropTypes.string,
  textValue: PropTypes.array,
  selectValue: PropTypes.string,
  text: PropTypes.array,
}

export default Edit;
