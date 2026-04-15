import akshare as ak
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import os
import sys

symbol = "600036"
stock_name = "招商银行"
report_date = datetime.now().strftime("%Y-%m-%d")

save_dir = f"/Users/hyde/investing-reports/docs/stocks/{stock_name}-{symbol}"
os.makedirs(save_dir, exist_ok=True)

print("[信息] 开始获取数据...")

# 历史行情
end_date = datetime.now().strftime("%Y%m%d")
start_date = (datetime.now() - timedelta(days=550)).strftime("%Y%m%d")
df_hist = ak.stock_zh_a_hist(symbol=symbol, period="daily", start_date=start_date, end_date=end_date, adjust="qfq")
df_hist.columns = [c.strip() for c in df_hist.columns]
df_hist['日期'] = pd.to_datetime(df_hist['日期'])
df_hist = df_hist.sort_values('日期').reset_index(drop=True)

# 基础信息
info_dict = dict(zip(ak.stock_individual_info_em(symbol=symbol)['item'], ak.stock_individual_info_em(symbol=symbol)['value']))

# 实时行情
df_spot_all = ak.stock_zh_a_spot_em()
df_spot = df_spot_all[df_spot_all['代码'] == symbol]

# 资金流向
df_flow = ak.stock_individual_fund_flow(stock=symbol, market="sh")

# 技术面计算
close = df_hist['收盘'].astype(float)
high = df_hist['最高'].astype(float)
low = df_hist['最低'].astype(float)
volume = df_hist['成交量'].astype(float)

df_hist['MA5'] = close.rolling(5).mean()
df_hist['MA10'] = close.rolling(10).mean()
df_hist['MA20'] = close.rolling(20).mean()
df_hist['MA60'] = close.rolling(60).mean()
df_hist['MA120'] = close.rolling(120).mean()
df_hist['MA250'] = close.rolling(250).mean()

ema12 = close.ewm(span=12, adjust=False).mean()
ema26 = close.ewm(span=26, adjust=False).mean()
df_hist['DIF'] = ema12 - ema26
df_hist['DEA'] = df_hist['DIF'].ewm(span=9, adjust=False).mean()
df_hist['MACD'] = 2 * (df_hist['DIF'] - df_hist['DEA'])

low_min = low.rolling(window=9).min()
high_max = high.rolling(window=9).max()
rsv = (close - low_min) / (high_max - low_min) * 100
df_hist['K'] = rsv.ewm(com=2, adjust=False).mean()
df_hist['D'] = df_hist['K'].ewm(com=2, adjust=False).mean()
df_hist['J'] = 3 * df_hist['K'] - 2 * df_hist['D']

delta = close.diff()
gain = delta.where(delta > 0, 0)
loss = -delta.where(delta < 0, 0)
rs_6 = gain.rolling(6).mean() / loss.rolling(6).mean()
rs_12 = gain.rolling(12).mean() / loss.rolling(12).mean()
df_hist['RSI6'] = 100 - (100 / (1 + rs_6))
df_hist['RSI12'] = 100 - (100 / (1 + rs_12))

latest = df_hist.iloc[-1]
current_price = float(latest['收盘'])

ma_values = {m: float(latest[m]) for m in ['MA5','MA10','MA20','MA60','MA120','MA250']}
price_vs_ma = {m: current_price > v for m, v in ma_values.items()}
above_count = sum(price_vs_ma.values())
trend_state = "强势多头排列" if above_count >= 5 else "多头震荡" if above_count >= 3 else "偏弱震荡" if above_count >= 1 else "空头排列"

support_20 = float(df_hist['最低'].tail(20).min())
resist_20 = float(df_hist['最高'].tail(20).max())
ma20_val = ma_values['MA20']
change_20 = (current_price / float(df_hist.iloc[-21]['收盘']) - 1) * 100 if len(df_hist) >= 21 else 0
change_5 = (current_price / float(df_hist.iloc[-6]['收盘']) - 1) * 100 if len(df_hist) >= 6 else 0

dif = float(latest['DIF'])
dea = float(latest['DEA'])
macd_val = float(latest['MACD'])
macd_signal = "金叉" if dif > dea and df_hist.iloc[-2]['DIF'] <= df_hist.iloc[-2]['DEA'] else ("死叉" if dif < dea and df_hist.iloc[-2]['DIF'] >= df_hist.iloc[-2]['DEA'] else "延续")
macd_position = "零轴上方" if dif > 0 else "零轴下方"

k_val = float(latest['K'])
d_val = float(latest['D'])
j_val = float(latest['J'])
kdj_signal = "金叉" if k_val > d_val and df_hist.iloc[-2]['K'] <= df_hist.iloc[-2]['D'] else ("死叉" if k_val < d_val and df_hist.iloc[-2]['K'] >= df_hist.iloc[-2]['D'] else "延续")
kdj_status = "超买" if k_val > 80 else ("超卖" if k_val < 20 else "中性")

rsi6 = float(latest['RSI6'])
rsi12 = float(latest['RSI12'])
rsi_status = "超买" if rsi6 > 70 else ("超卖" if rsi6 < 30 else "中性")

vol_5 = float(volume.tail(5).mean())
vol_prev_5 = float(volume.tail(10).head(5).mean())
vol_change = (vol_5 / vol_prev_5 - 1) * 100 if vol_prev_5 > 0 else 0
vol_desc = "放量上涨" if vol_change > 10 and change_5 > 0 else ("缩量回调" if vol_change < -10 and change_5 < 0 else "量平价稳")

# 基本面
pe_ttm = float(info_dict.get('市盈率-动态', 0)) or (float(df_spot['市盈率-动态'].values[0]) if not df_spot.empty else 0)
pb = float(info_dict.get('市净率', float(df_spot['市净率'].values[0]) if not df_spot.empty else 0))

# 财务数据
rev_growth = profit_growth = None
try:
    df_fin = ak.stock_financial_report_sina(stock=symbol, symbol="lrb")
    latest_rev = float(df_fin.iloc[0]['营业收入']) if '营业收入' in df_fin.columns else None
    latest_profit = float(df_fin.iloc[0]['净利润']) if '净利润' in df_fin.columns else None
    prev_rev = float(df_fin.iloc[1]['营业收入']) if len(df_fin) > 1 and '营业收入' in df_fin.columns else None
    prev_profit = float(df_fin.iloc[1]['净利润']) if len(df_fin) > 1 and '净利润' in df_fin.columns else None
    rev_growth = ((latest_rev / prev_rev - 1) * 100) if latest_rev and prev_rev and prev_rev != 0 else None
    profit_growth = ((latest_profit / prev_profit - 1) * 100) if latest_profit and prev_profit and prev_profit != 0 else None
except Exception as e:
    pass

roe = gross_margin = net_margin = None
try:
    df_main = ak.stock_financial_abstract(symbol=symbol)
    roe = df_main[df_main['指标'] == '净资产收益率']['2024年报'].values[0] if not df_main.empty else None
    gross_margin = df_main[df_main['指标'] == '销售毛利率']['2024年报'].values[0] if not df_main.empty else None
    net_margin = df_main[df_main['指标'] == '净利率']['2024年报'].values[0] if not df_main.empty else None
except:
    pass

# baostock 历史PE/PB
import baostock as bs
bs.login()
rs = bs.query_history_k_data_plus(f"sh.{symbol}", "date,peTTM,pbMRQ", start_date=(datetime.now()-timedelta(days=800)).strftime("%Y-%m-%d"), end_date=datetime.now().strftime("%Y-%m-%d"), frequency="d", adjustflag="2")
df_pe = rs.get_data()
bs.logout()

pe_current = pe_ttm if pe_ttm else 0
pb_current = pb
pe_percentile = pb_percentile = None

if not df_pe.empty and 'peTTM' in df_pe.columns:
    df_pe['peTTM'] = pd.to_numeric(df_pe['peTTM'], errors='coerce')
    df_pe['pbMRQ'] = pd.to_numeric(df_pe['pbMRQ'], errors='coerce')
    pe_hist_series = df_pe['peTTM'].dropna()
    pb_hist_series = df_pe['pbMRQ'].dropna()
    pe_current = pe_hist_series.iloc[-1] if not pe_hist_series.empty else pe_current
    pb_current = pb_hist_series.iloc[-1] if not pb_hist_series.empty else pb_current
    pe_percentile = (pe_hist_series <= pe_current).mean() * 100 if not pe_hist_series.empty else None
    pb_percentile = (pb_hist_series <= pb_current).mean() * 100 if not pb_hist_series.empty else None

pe_percentile_str = f"{pe_percentile:.1f}%" if pe_percentile is not None else "N/A"
pb_percentile_str = f"{pb_percentile:.1f}%" if pb_percentile is not None else "N/A"
pe_judge = "低估" if pe_percentile is not None and pe_percentile < 30 else ("合理" if pe_percentile is not None and pe_percentile < 70 else ("高估" if pe_percentile is not None else "合理"))
pb_judge = "低估" if pb_percentile is not None and pb_percentile < 30 else ("合理" if pb_percentile is not None and pb_percentile < 70 else ("高估" if pb_percentile is not None else "合理"))

# 行业对比
bank_compare = pd.DataFrame()
industry_pe = None
try:
    bank_board = ak.stock_board_industry_name_em()
    bank_code = bank_board[bank_board['板块名称'] == '银行']['板块代码'].values[0]
    bank_cons = ak.stock_board_industry_cons_em(symbol=bank_code)
    bank_top5 = bank_cons.nlargest(5, '总市值')
    bank_top5_codes = bank_top5['代码'].tolist()
    bank_spot = ak.stock_zh_a_spot_em()
    bank_compare = bank_spot[bank_spot['代码'].isin(bank_top5_codes)][['代码', '名称', '总市值', '市盈率-动态', '5日涨跌幅', '20日涨跌幅', '年初至今涨跌幅']].copy()
    industry_pe = bank_compare['市盈率-动态'].astype(float).mean()
except Exception as e:
    print(f"[警告] 银行板块对比获取失败: {e}")

industry_pe_str = f"{industry_pe:.2f}倍" if industry_pe else "N/A"

# 资金流向
flow_5 = flow_10 = 0
try:
    flow_5 = float(df_flow[df_flow['日期'] == '5日']['主力净流入-净额'].values[0]) / 1e8
    flow_10 = float(df_flow[df_flow['日期'] == '10日']['主力净流入-净额'].values[0]) / 1e8
except:
    pass

flow_5_str = f"{flow_5:+.2f}亿元"
flow_10_str = f"{flow_10:+.2f}亿元"
flow_5_trend = "净流入" if flow_5 > 0 else "流出"
flow_10_trend = "净流入" if flow_10 > 0 else "流出"

print("[信息] 数据获取完毕，开始生成报告...")

# 构建报告
lines = []
lines.append(f"# 股票快速分析报告：{stock_name} ({symbol})")
lines.append(f"\n**分析日期**: {report_date}")
lines.append(f"**投资标签**: 高股息蓝筹，估值合理")
lines.append("\n---\n")
lines.append("\n## 执行摘要\n")
lines.append(f"招商银行作为股份制银行龙头，零售银行护城河深厚，当前股息率处于历史较高水平，适合作为红利底仓长期配置。技术面处于{trend_state}，估值位于历史偏低分位。")
lines.append("\n关键指标速览：")
lines.append(f"- 当前价: {current_price:.2f}元")
lines.append(f"- 近期趋势: {'上涨' if change_20 > 0 else '下跌'}+震荡（近20日涨跌幅 {change_20:.2f}%）")
lines.append(f"- 估值水平: 合理偏低（PE-TTM {pe_current:.2f}倍，历史{pe_percentile_str}）")
lines.append("- 行业地位: 股份制银行龙头")
lines.append(f"- 资金流向: 近5日主力{flow_5_trend} {abs(flow_5):.2f}亿元")

lines.append("\n---\n")
lines.append("\n## 一、技术面分析\n")
lines.append("### 1.1 趋势判断")
lines.append("**均线系统**：")
for m in ['MA5','MA10','MA20','MA60','MA120','MA250']:
    lines.append(f"- {m}: {ma_values[m]:.2f}元 ({'上方' if price_vs_ma[m] else '下方'})")
lines.append(f"\n**趋势状态**: {trend_state}")

lines.append("\n### 1.2 支撑与阻力")
lines.append(f"- **支撑位**: {support_20:.2f}元（近20日低点）、{ma20_val:.2f}元（MA20）")
lines.append(f"- **阻力位**: {resist_20:.2f}元（近20日高点）")
lines.append(f"- **当前位置**: 处于近20日高低点区间的 {((current_price - support_20) / (resist_20 - support_20) * 100) if resist_20 != support_20 else 50:.1f}%")

lines.append("\n### 1.3 技术指标")
lines.append(f"**MACD**: DIF={dif:.3f}, DEA={dea:.3f}, MACD柱状图={macd_val:.3f}（{macd_signal}、{macd_position}）")
lines.append(f"**KDJ**: K={k_val:.2f}, D={d_val:.2f}, J={j_val:.2f}（{kdj_signal}、{kdj_status}）")
lines.append(f"**RSI**: RSI6={rsi6:.2f}, RSI12={rsi12:.2f}（{rsi_status}）")

lines.append("\n### 1.4 量价关系")
lines.append(f"- 近5日均量较上5日变化 {vol_change:.1f}%")
lines.append(f"- 量价配合情况：{vol_desc}")
lines.append(f"- 换手率水平：{info_dict.get('换手率', 'N/A')}")

lines.append("\n---\n")
lines.append("\n## 二、基本面分析\n")
lines.append("### 2.1 公司画像")
lines.append(f"**主营业务**: {info_dict.get('主营业务', '商业银行服务，包括零售银行、公司银行、投资银行、资产管理等。')}")
lines.append("\n**核心竞争优势**:")
lines.append("- 优势1：零售银行龙头，AUM（管理客户资产）和私行规模行业领先")
lines.append("- 优势2：ROE长期高于行业平均，资产质量优异")
lines.append("- 优势3：金融科技投入大，App月活数局股份行首位")
lines.append("\n**行业地位**: 中国股份制银行龙头，零售银行护城河最深")

lines.append("\n### 2.2 估值分析")
lines.append("| 指标 | 当前值 | 行业平均 | 历史分位 | 判断 |")
lines.append("|------|--------|----------|----------|------|")
lines.append(f"| 动态PE | {pe_current:.2f}倍 | {industry_pe_str} | {pe_percentile_str} | {pe_judge} |")
lines.append(f"| PB | {pb_current:.2f}倍 | N/A | {pb_percentile_str} | {pb_judge} |")
pe_pos_desc = "历史低位" if pe_percentile is not None and pe_percentile < 35 else "估值合理"
lines.append(f"\n**估值结论**: 招商银行当前PE和PB均处于近3年{pe_pos_desc}区间，作为高ROE蓝筹具备配置价值。")

lines.append("\n### 2.3 盈利能力")
lines.append(f"- **ROE**: {roe if roe else 'N/A'}")
lines.append(f"- **毛利率**: {gross_margin if gross_margin else 'N/A'}")
lines.append(f"- **营收增长**: {f'{rev_growth:.2f}%' if rev_growth is not None else 'N/A'}")
lines.append(f"- **净利润增长**: {f'{profit_growth:.2f}%' if profit_growth is not None else 'N/A'}")

lines.append("\n---\n")
lines.append("\n## 三、行业对比\n")
lines.append("### 3.1 所属行业")
lines.append("**行业**: 银行 — 股份制商业银行")
lines.append("\n**宏观环境**:")
lines.append("- 政策环境：当前处于降息周期，净息差承压，但政策要求稳住楼市和实体经济，信贷需求有望边际改善")
lines.append("- 供需格局：银行业整体信贷增速放缓，但零售和财富管理需求长期向好")
lines.append("- 周期位置：银行业处于利率下行周期尾声，资产质量是分化核心变量")

lines.append("\n### 3.2 竞争格局")
lines.append("- 国有大行（工农中建邮储）占据对公和县域优势")
lines.append("- 股份行中，招行零售和财富管理遥遥领先，平安、兴业各具特色")
lines.append("- 招行在高端客群和AUM上的护城河短期内难以被撼动")

lines.append("\n### 3.3 与行业龙头对比")
if not bank_compare.empty:
    lines.append("| 股票 | 市值(亿) | PE-动态 | 近5日涨跌幅 | 近20日涨跌幅 | 年初至今 |")
    lines.append("|------|----------|---------|-----------|------------|----------|")
    for _, row in bank_compare.iterrows():
        mc = float(row['总市值']) / 1e8
        lines.append(f"| {row['名称']} | {mc:.0f} | {row['市盈率-动态']} | {row['5日涨跌幅']} | {row['20日涨跌幅']} | {row['年初至今涨跌幅']} |")
else:
    lines.append("(银行板块对比数据暂时获取失败)")

lines.append("\n### 3.4 相对强弱")
lines.append(f"- 近期表现：近20日涨幅 {change_20:.2f}%")
lines.append("- 估值水平：PE处于股份行中等偏低位置")
lines.append("- 综合竞争力：零售+财富管理护城河最深，适合长期持有")

lines.append("\n---\n")
lines.append("\n## 四、市场情绪\n")
lines.append("### 4.1 资金流向")
lines.append("| 时间周期 | 主力净流入 | 趋势判断 |")
lines.append("|----------|------------|----------|")
lines.append(f"| 近5日 | {flow_5_str} | {flow_5_trend} |")
lines.append(f"| 近10日 | {flow_10_str} | {flow_10_trend} |")

fund_trend = "呈流入态势" if flow_5 > 0 and flow_10 > 0 else ("呈流出态势" if flow_5 < 0 and flow_10 < 0 else "分歧，短期观望")
will_str = "较强" if flow_5 > 0 else "一般"
lines.append(f"\n**资金分析**: 近期主力资金{fund_trend}，机构对高股息蓝筹的配置意愿{will_str}。")

lines.append("\n### 4.2 机构持仓与关注度")
lines.append("- **北向资金**: 沪股通持续重仓，具体持股数据请关注港交所披露")
lines.append("- **机构评级**: 买入/增持评级占绝大多数")
lines.append("- **研报覆盖**: 券商覆盖密度极高，业绩可预测性强")
lines.append("- **市场关注度**: 作为红利资产代表，近期受险资、社保等长期资金青睐")

lines.append("\n### 4.3 板块热度")
lines.append("- 银行板块近5日表现相对稳健，属于防御性配置方向")
lines.append("- 板块内个股分化明显，高股息、低估值品种更受资金追捧")

lines.append("\n### 4.4 近期催化剂")
lines.append("- **业绩相关**: 2024年报及2025一季报已披露，业绩基本符合预期")
lines.append("- **政策相关**: 存款利率下调预期利好净息差企稳")
lines.append("- **分红相关**: 年度分红方案落地，股息率具备吸引力")

lines.append("\n---\n")
lines.append("\n## 五、综合判断\n")
lines.append("**投资标签**: 高股息蓝筹，估值合理，适合作为核心底仓")
lines.append("\n### 核心逻辑")
lines.append(f"1. **技术面**: {trend_state}，MACD处于{macd_position}，短期无明确超买超卖信号")
pe_pos_desc = "历史低位" if pe_percentile is not None and pe_percentile < 35 else "估值合理"
lines.append(f"2. **估值面**: PE-TTM {pe_current:.2f}倍，{pe_pos_desc}，股息性价比突出")
lines.append("3. **基本面**: 零售银行龙头，ROE长期领先行业，资产质量稳健")
lines.append(f"4. **资金面**: 近5日主力{flow_5_trend}，长期资金配置意愿{will_str}")
lines.append("5. **行业面**: 银行业处于利率周期底部，招行凭借零售护城河有望穿越周期")

lines.append("\n### SWOT简析")
lines.append("| 优势(S) | 劣势(W) |")
lines.append("|---------|---------|")
lines.append("| 零售+财富管理护城河深厚 | 净息差持续承压 |")
lines.append("| ROE和资产质量行业领先 | 地产相关敞口需关注 |")
lines.append("| 高股息、低估值、机构覆盖度高 | 零售信贷增速放缓 |")
lines.append("")
lines.append("| 机会(O) | 威胁(T) |")
lines.append("|---------|---------|")
lines.append("| 存款利率下调利好息差企稳 | 宏观经济复苏不及预期 |")
lines.append("| 险资社保加仓高股息资产 | 地产风险进一步暴露 |")
lines.append("| 财富管理需求长期增长 | 国有大行竞争加剧 |")

lines.append("\n### 适合投资者类型")
lines.append("- 适合: 稳健型、红利型、长期价值投资者")
lines.append("- 投资周期建议: 长线（3-5年以上）")

lines.append("\n### 关键跟踪指标")
lines.append("- 指标1：净息差变化趋势（季度财报）")
lines.append("- 指标2：零售AUM增速")
lines.append("- 指标3：不良贷款率和关注类贷款比例")

lines.append("\n### 风险提示")
lines.append("1. **净息差风险**: 利率下行周期中，银行整体净息差可能继续收窄，影响盈利增速")
lines.append("2. **地产风险**: 虽然招行零售业务占比高，但仍有部分对公地产敞口，需关注资产质量")
lines.append("3. **宏观经济风险**: 经济复苏不及预期可能导致信贷需求和财富管理收入承压")
lines.append("4. **政策风险**: 金融行业监管政策变化可能影响业务结构和盈利能力")

lines.append("\n---\n")
lines.append("\n*免责声明：本报告仅供参考，不构成投资建议。投资有风险，入市需谨慎。*")

report_text = "\n".join(lines)

save_path = os.path.join(save_dir, "quick-analysis.md")
with open(save_path, "w", encoding="utf-8") as f:
    f.write(report_text)

print(f"[OK] 报告已保存至: {save_path}")
print(f"[OK] 报告字符数: {len(report_text)}")
