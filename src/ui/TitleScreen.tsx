import './TitleScreen.css';

interface TitleScreenProps {
  onLevelSelect: (levelNumber: number) => void;
}

export function TitleScreen({ onLevelSelect }: TitleScreenProps) {
  return (
    <div className="title-screen">
      <div className="title-content">
        <h1 className="game-title">スナップフィット工房</h1>
        <p className="game-subtitle">SnapFit Workshop</p>

        <div className="controls-section">
          <h2>操作方法</h2>
          <div className="controls-grid">
            <div className="control-group">
              <h3>基本操作</h3>
              <ul>
                <li><kbd>Tab</kbd> - パーツ切替</li>
                <li><kbd>1</kbd><kbd>2</kbd><kbd>3</kbd> - 直接選択</li>
                <li><kbd>Enter</kbd> - 掴む/離す</li>
              </ul>
            </div>
            <div className="control-group">
              <h3>移動</h3>
              <ul>
                <li><kbd>↑</kbd><kbd>↓</kbd><kbd>←</kbd><kbd>→</kbd> - 水平移動</li>
                <li><kbd>U</kbd><kbd>O</kbd> - 上下移動</li>
                <li><kbd>Shift</kbd> + 矢印 - 微調整</li>
              </ul>
            </div>
            <div className="control-group">
              <h3>回転</h3>
              <ul>
                <li><kbd>Q</kbd><kbd>E</kbd> - Y軸回転</li>
                <li><kbd>;</kbd><kbd>'</kbd> - X軸回転</li>
                <li><kbd>[</kbd><kbd>]</kbd> - Z軸回転</li>
              </ul>
            </div>
            <div className="control-group">
              <h3>その他</h3>
              <ul>
                <li><kbd>S</kbd> - スナップ試行</li>
                <li><kbd>H</kbd> - ヒント表示</li>
                <li><kbd>V</kbd> - ゴースト表示切替</li>
                <li><kbd>Backspace</kbd> - リセット</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="level-selection">
          <h2>レベルを選択</h2>
          <div className="level-buttons">
            <button
              className="level-button level-1"
              onClick={() => onLevelSelect(1)}
            >
              <div className="level-number">1</div>
              <div className="level-name">チュートリアル</div>
              <div className="level-desc">基本を学ぼう</div>
            </button>
            <button
              className="level-button level-2"
              onClick={() => onLevelSelect(2)}
            >
              <div className="level-number">2</div>
              <div className="level-name">ステップアップ</div>
              <div className="level-desc">回転を使いこなそう</div>
            </button>
            <button
              className="level-button level-3"
              onClick={() => onLevelSelect(3)}
            >
              <div className="level-number">3</div>
              <div className="level-name">チャレンジ</div>
              <div className="level-desc">複雑な組み立て</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
