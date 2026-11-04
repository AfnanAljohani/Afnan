"""End-to-end browser checks against the local test stack (tests/e2e/start.sh).
Uses only isolated test data. Run:  python3 tests/e2e/browser_test.py <shots_dir>
"""
import json, os, re, subprocess, sys, time, urllib.request
from playwright.sync_api import sync_playwright, expect

BASE = 'http://localhost:3000'
SHOTS = sys.argv[1] if len(sys.argv) > 1 else 'tests/e2e/.run/shots'
os.makedirs(SHOTS, exist_ok=True)
MEDIA = os.path.abspath('tests/fixtures/media')
ADMIN = ('admin@test.local', 'Admin-Test-Pass-2026!')
MEMBER = ('member@test.local', 'Member-Test-Pass-2026!')
results = []
console = {}

def check(name, cond, detail=''):
    results.append((name, bool(cond), detail))
    print(('PASS ' if cond else 'FAIL ') + name + (f'  — {detail}' if detail and not cond else ''), flush=True)

def sql(q):
    return subprocess.run(['psql', '-h', '127.0.0.1', '-p', '54329', '-U', 'postgres', '-d', 'ewa_ai_e2e', '-tAc', q], capture_output=True, text=True).stdout.strip()

def ollama_mode(m):
    urllib.request.urlopen(f'http://127.0.0.1:54500/__mode?m={m}').read()

def watch(page, key):
    console.setdefault(key, [])
    page.on('console', lambda m: console[key].append(m.text) if m.type == 'error' and 'fonts.g' not in m.text and 'TUNNEL' not in m.text else None)
    page.on('pageerror', lambda e: console[key].append('PAGEERROR ' + str(e)))

def shot(page, name, full=False):
    page.evaluate("document.querySelectorAll('.reveal').forEach(e=>e.classList.add('in'))")
    page.screenshot(path=f'{SHOTS}/{name}.png', full_page=full)

def wait_value(page, sel, pred, timeout=15):
    # CSP on /admin forbids eval, so poll from Python instead of wait_for_function
    end = time.time() + timeout
    while time.time() < end:
        v = page.input_value(sel)
        if pred(v): return v
        page.wait_for_timeout(200)
    raise AssertionError(f'{sel} never matched (last value {v!r})')

def login(page, who):
    page.goto(BASE + '/admin'); page.wait_for_selector('#apLogin:not([hidden]), #apApp:not([hidden])')
    if page.is_visible('#apApp'): return
    page.fill('#apEmail', who[0]); page.fill('#apPass', who[1]); page.click('#apLoginForm button[type=submit]')

sql('delete from chat_rate')  # fresh visitor budget for this run

# ---------------------------------------------------------------- scheduled job (as the scheduler calls it)
def cron_call(secret):
    req = urllib.request.Request(BASE + '/api/cron/library', headers={'Authorization': f'Bearer {secret}'} if secret else {})
    try:
        r = urllib.request.urlopen(req, timeout=120); return r.status, json.loads(r.read() or b'{}')
    except urllib.error.HTTPError as e:
        return e.code, {}
check('cron: rejected without the secret', cron_call(None)[0] == 401)
check('cron: rejected with a wrong secret', cron_call('wrong-secret')[0] == 401)
st, body = cron_call('test-cron-secret-0123456789abcdef')
check('cron: scheduled run finishes (200/207)', st in (200, 207), f'{st} {body}')
check('cron: run logged with trigger=schedule', sql("select count(*) from library_runs where trigger='schedule' and finished_at is not null") == '1')
n1 = sql('select count(*) from library_items')
st2, _ = cron_call('test-cron-secret-0123456789abcdef')
check('cron: second run adds no duplicates', st2 in (200, 207) and sql('select count(*) from library_items') == n1, n1)
check('cron: failing source logged, earlier items kept', sql("select count(*) from library_runs where errors::text like '%Timed out%'") == '2' and int(n1) > 0)

with sync_playwright() as p:
    browser = p.chromium.launch()
    desk = dict(viewport={'width': 1440, 'height': 900}, reduced_motion='reduce', locale='ar-SA', timezone_id='Asia/Riyadh', ignore_https_errors=True)
    mob = dict(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True, device_scale_factor=2, reduced_motion='reduce', locale='ar-SA', timezone_id='Asia/Riyadh', ignore_https_errors=True)

    # ------------------------------------------------------------ home (visitor)
    ctx = browser.new_context(**desk); page = ctx.new_page(); watch(page, 'home-desktop')
    page.goto(BASE + '/', wait_until='networkidle'); page.wait_for_timeout(1500)
    check('home: Arabic RTL document', page.evaluate("document.documentElement.dir") == 'rtl')
    card = page.locator('#projects-list .proj-card').first
    check('projects: AI screen card shown', 'الشاشة الرقمية لبرنامج الذكاء الاصطناعي' in card.inner_text())
    check('projects: credited to أفنان الجهني', 'إعداد وتطوير: أفنان الجهني' in card.inner_text())
    a = card.locator('a.btn')
    check('projects: «عرض المشروع» opens the real URL in a new tab safely',
          a.get_attribute('href') == 'https://afnanaljohani.github.io/Afnan/ai-club-screen/' and a.get_attribute('target') == '_blank' and 'noopener' in a.get_attribute('rel'))
    check('projects: cover labelled as a real screenshot', card.locator('.proj-badge').inner_text() == 'لقطة من المشروع')
    check('video: section hidden until published', page.locator('#saudi-ai').is_hidden())
    check('library teaser: 3 newest items', page.locator('#libDailyList li').count() == 3)
    check('library teaser: last successful update shown', 'آخر تحديث ناجح' in page.inner_text('#libDailyMeta'))
    check('news: rendered from database (6)', page.locator('#news-list .ccard').count() == 6)
    check('events: rendered from database (11)', page.locator('#camps-list .ccard').count() == 11)
    check('nav: link to the library page', page.locator('#navLinks a[href="library"]').count() == 1)
    check('nav: link to projects', page.locator('#navLinks a[href="#projects"]').count() == 1)
    check('existing sections kept', all(page.locator(s).count() == 1 for s in ['#club', '#chairman', '#about', '#heroes', '#events', '#camps', '#news', '#structure', '#ideas', '#plan', '#survey', '#library', '#join']))
    gold = page.evaluate("getComputedStyle(document.documentElement).getPropertyValue('--gold').trim()")
    check('identity: brand colour is green', page.evaluate("getComputedStyle(document.querySelector('.btn-primary')).backgroundImage").find('63, 214, 143') >= 0, gold)
    shot(page, 'after-home-desktop-top'); shot(page, 'after-home-desktop-full', True)

    # assistant
    page.click('.ec-fab'); page.wait_for_selector('#ecPanel:not([hidden])')
    check('chat: welcome message + 4 suggestions', page.locator('.ec-msg.ec-bot').count() >= 1 and page.locator('.ec-chips button').count() == 4)
    page.locator('.ec-chips button', has_text='ما أحدث أخبار').click()
    page.wait_for_selector('.ec-msg.ec-bot >> text=رد تجريبي', timeout=15000); page.wait_for_timeout(600)
    cite = page.locator('.ec-cite').first
    check('chat: streamed answer with source link from the library', cite.count() == 1 and cite.get_attribute('href').startswith('https://') and cite.get_attribute('rel') == 'noopener noreferrer')
    shot(page, 'after-chat-answer')
    ollama_mode('down')
    page.fill('#ecIn', 'سؤال أثناء تعطل الخدمة'); page.keyboard.press('Enter')
    page.wait_for_selector('.ec-err', timeout=15000)
    check('chat: clear error when the model is down', 'تعذّر الوصول' in page.inner_text('.ec-err') and page.locator('.ec-retry').count() == 1)
    ollama_mode('ok'); page.click('.ec-retry'); page.wait_for_timeout(2500)
    check('chat: retry succeeds after recovery', page.locator('.ec-msg.ec-bot >> text=رد تجريبي').count() >= 2)
    page.click('.ec-lang')
    check('chat: English mode switches direction', page.get_attribute('#ecPanel', 'dir') == 'ltr' and 'Club assistant' in page.inner_text('#ecTitle'))
    page.keyboard.press('Escape')
    check('chat: Escape closes and returns focus', page.locator('#ecPanel').is_hidden() and page.evaluate("document.activeElement.classList.contains('ec-fab')"))
    ctx.close()

    # ------------------------------------------------------------ home (mobile)
    ctx = browser.new_context(**mob); page = ctx.new_page(); watch(page, 'home-mobile')
    page.goto(BASE + '/', wait_until='networkidle'); page.wait_for_timeout(1200)
    sw = page.evaluate("document.documentElement.scrollWidth")
    check('mobile: no horizontal scroll', sw <= 390, f'scrollWidth={sw}')
    fab, dock = page.locator('.ec-fab').bounding_box(), page.locator('.dock').bounding_box()
    check('mobile: chat button does not cover the dock', fab and dock and fab['y'] + fab['height'] <= dock['y'] + 1, f'{fab} {dock}')
    shot(page, 'after-home-mobile-top')
    page.locator('#projects').scroll_into_view_if_needed(); page.wait_for_timeout(300); shot(page, 'after-projects-mobile')
    page.click('.ec-fab'); page.wait_for_timeout(300)
    pb = page.locator('#ecPanel').bounding_box()
    check('mobile: chat panel fits the screen', pb['x'] >= 0 and pb['x'] + pb['width'] <= 390)
    shot(page, 'after-chat-mobile')
    ctx.close()

    # ------------------------------------------------------------ library page
    sql("""insert into library_items (source_name,url,url_hash,title,language,content_type,category,published_at,summary_ar,status)
           select 'Test source','https://example.com/t/'||g, md5('t'||g)||md5('x'||g),'Pagination test item '||g,'en','article','apps-tools', now()-(g||' days')::interval - interval '40 days','عنصر اختبار','published' from generate_series(1,20) g""")
    ctx = browser.new_context(**desk); page = ctx.new_page(); watch(page, 'library')
    page.goto(BASE + '/library', wait_until='networkidle'); page.wait_for_timeout(800)
    check('library: first page of 12 cards', page.locator('.lcard').count() == 12)
    check('library: total count shown', page.inner_text('#libCount').startswith('30'))
    check('library: last successful update from the run log', 'آخر تحديث ناجح' in page.inner_text('#libStatus'))
    page.click('#libMore'); page.wait_for_timeout(600)
    check('library: «تحميل المزيد» loads the next page', page.locator('.lcard').count() == 24)
    first = page.locator('.lcard').first
    check('library: card shows source, publish date, added date, original link', all(t in first.inner_text() for t in ['المصدر:', 'تاريخ النشر', 'أُضيف للمكتبة', 'اقرأ المادة الأصلية']))
    check('library: auto summaries are labelled', page.locator('.ai-tag').count() > 0)
    shot(page, 'after-library-desktop-top')
    page.click('#libTabs button[data-cat="saudi"]'); page.wait_for_timeout(700)
    titles = page.locator('.lcard h3').all_inner_texts()
    check('library: Saudi section', len(titles) == 2 and any('HUMAIN' in t for t in titles) and any('الرياض' in t for t in titles), str(titles))
    shot(page, 'after-library-saudi')
    page.click('#libTabs button[data-cat="all"]'); page.fill('#libQ', 'HUMAIN'); page.wait_for_timeout(900)
    check('library: search', page.locator('.lcard').count() == 1)
    page.fill('#libQ', ''); page.select_option('#libType', 'research'); page.wait_for_timeout(800)
    check('library: filter by content type', page.locator('.lcard').count() == 3, str(page.locator('.lcard').count()))
    page.select_option('#libType', ''); page.select_option('#libDate', '7'); page.wait_for_timeout(800)
    check('library: filter by date (7 days)', page.locator('.lcard').count() == 7, str(page.locator('.lcard').count()))
    page.select_option('#libDate', ''); page.locator('#libTabs button', has_text='الرؤية الحاسوبية').click(); page.wait_for_timeout(700)
    check('library: category tab', page.locator('.lcard').count() == 1)
    page.goto(BASE + '/library#saudi', wait_until='networkidle'); page.wait_for_timeout(800)
    check('library: direct link to a tab', page.get_attribute('#libTabs button[data-cat="saudi"]', 'aria-pressed') == 'true')
    ctx.close()
    ctx = browser.new_context(**mob); page = ctx.new_page(); watch(page, 'library-mobile')
    page.goto(BASE + '/library', wait_until='networkidle'); page.wait_for_timeout(800)
    check('library mobile: no horizontal scroll', page.evaluate("document.documentElement.scrollWidth") <= 390)
    shot(page, 'after-library-mobile')
    ctx.close()
    sql("delete from library_items where source_name='Test source'")

    # ------------------------------------------------------------ admin: access control
    ctx = browser.new_context(**desk); page = ctx.new_page(); watch(page, 'admin-anon')
    page.goto(BASE + '/admin', wait_until='networkidle')
    check('admin: direct URL opens the sign-in form', page.is_visible('#apLogin') and page.is_hidden('#apApp'))
    shot(page, 'after-admin-login')
    page.fill('#apEmail', ADMIN[0]); page.fill('#apPass', 'wrong-password-123'); page.click('#apLoginForm button[type=submit]'); page.wait_for_timeout(700)
    check('admin: wrong password rejected', 'غير صحيحة' in page.inner_text('#apLoginMsg') and page.is_hidden('#apApp'))
    page.fill('#apEmail', MEMBER[0]); page.fill('#apPass', MEMBER[1]); page.click('#apLoginForm button[type=submit]')
    page.wait_for_selector('#apDenied:not([hidden])')
    check('admin: signed-in non-admin sees «لا تملك صلاحية»', page.is_hidden('#apApp'))
    page.goto(BASE + '/#admin', wait_until='networkidle'); page.wait_for_timeout(1200)
    check('old in-page panel: editors stay locked for a non-admin', page.is_hidden('#admBody') and page.is_visible('#admGate'))
    ctx.close()

    # ------------------------------------------------------------ admin: management
    ctx = browser.new_context(**desk); page = ctx.new_page(); watch(page, 'admin')
    login(page, ADMIN); page.wait_for_selector('#apApp:not([hidden])')
    page.wait_for_timeout(1200)
    st = page.inner_text('#apStatus')
    check('admin: overview shows service health', 'تعمل' in st and 'مضبوط' in st, st)
    shot(page, 'after-admin-overview')

    # projects: draft → not public → publish → public → delete
    page.click('#t-projects'); page.wait_for_selector('#list-projects .ap-row')
    page.click('[data-new="projects"]')
    page.fill('#fld-title', 'مشروع اختبار المعاينة'); page.fill('#fld-author', 'فريق الاختبار')
    page.fill('#fld-description', 'وصف اختبار فقط.'); page.fill('#fld-url', 'https://example.com/test-project')
    page.set_input_files('#apDlgFields input[data-upload="image"]', os.path.join(MEDIA, 'test-cover.png'))
    wait_value(page, '#fld-cover_url', lambda v: '/storage/v1/object/public/media/projects/' in v)
    check('admin: image upload (compressed to WebP)', page.input_value('#fld-cover_url').endswith('.webp'))
    page.fill('#fld-url', 'javascript:alert(1)'); page.click('#apDlgSave'); page.wait_for_timeout(300)
    check('admin: rejects a javascript: link', 'https://' in page.inner_text('#apDlgMsg'))
    page.fill('#fld-url', 'https://example.com/test-project')
    page.click('#apDlgPreview'); page.wait_for_timeout(300)
    check('admin: preview before publishing', page.locator('#apPreview .proj-card').count() == 1)
    shot(page, 'after-admin-project-editor')
    page.click('#apDlgSave'); page.wait_for_selector('.ap-toast.show')
    check('admin: save confirmation', 'تمت الإضافة' in page.inner_text('#apToast'))
    pub = browser.new_context(**desk).new_page()
    pub.goto(BASE + '/', wait_until='networkidle'); pub.wait_for_timeout(1000)
    check('draft project is not public', 'مشروع اختبار المعاينة' not in pub.inner_text('#projects-list'))
    page.locator('.ap-row', has_text='مشروع اختبار المعاينة').locator('[data-edit]').click()
    page.select_option('#fld-status', 'published'); page.click('#apDlgSave'); page.wait_for_selector('.ap-toast.show >> text=تم حفظ')
    pub.reload(wait_until='networkidle'); pub.wait_for_timeout(1000)
    check('published project appears on the site', 'مشروع اختبار المعاينة' in pub.inner_text('#projects-list'))
    page.reload(wait_until='networkidle'); page.wait_for_selector('#apApp:not([hidden])')
    page.click('#t-projects'); page.wait_for_selector('#list-projects .ap-row')
    check('admin: changes persist after reload (still signed in)', page.locator('.ap-row', has_text='مشروع اختبار المعاينة').locator('.st-published').count() == 1)
    page.locator('.ap-row', has_text='مشروع اختبار المعاينة').locator('[data-del]').click()
    page.wait_for_selector('#apConfirm[open]')
    check('admin: delete asks for confirmation', 'نهائيًا' in page.inner_text('#apConfirmText'))
    page.click('#apConfirm button[value="yes"]'); page.wait_for_selector('.ap-toast.show >> text=تم الحذف')
    check('admin: deleted', sql("select count(*) from projects where title='مشروع اختبار المعاينة'") == '0')

    # events
    page.click('#t-content'); page.wait_for_selector('#list-content .ap-row')
    page.click('#apKind button[data-f="event"]'); page.wait_for_timeout(500)
    page.click('[data-new="content"]'); page.fill('#fld-title', 'ورشة اختبار تجريبية'); page.fill('#fld-event_date', '2026-11-18')
    page.select_option('#fld-status', 'published'); page.click('#apDlgSave'); page.wait_for_selector('.ap-toast.show')
    pub.reload(wait_until='networkidle'); pub.wait_for_timeout(1000)
    check('published event appears in «المعسكرات والورش»', 'ورشة اختبار تجريبية' in pub.inner_text('#camps-list') or pub.locator('#camps-list .ccard', has_text='ورشة اختبار تجريبية').count() == 1)
    sql("delete from content_items where title='ورشة اختبار تجريبية'")

    # video
    page.click('#t-video'); page.wait_for_selector('#vid-title')
    page.fill('#vid-title', 'فيديو اختبار — الذكاء الاصطناعي في المملكة'); page.fill('#vid-description', 'فيديو اختبار معزول.')
    page.select_option('#vid-kind', 'file')
    page.set_input_files('#apVideoForm input[data-upload="video"]', os.path.join(MEDIA, 'test-video.mp4'))
    wait_value(page, '#vid-src', lambda v: v.endswith('.mp4'))
    page.set_input_files('#apVideoForm input[data-upload="vtt"]', os.path.join(MEDIA, 'test-captions.vtt'))
    wait_value(page, '#vid-captions', lambda v: v.endswith('.vtt'))
    page.set_input_files('#apVideoForm input[data-upload="image"]', os.path.join(MEDIA, 'test-cover.png'))
    wait_value(page, '#vid-poster', lambda v: v.endswith('.webp'))
    page.fill('#vid-source_name', 'مصدر اختبار'); page.select_option('#vid-status', 'published')
    page.click('#apVideoPrev'); page.wait_for_timeout(400)
    check('admin: video preview', page.locator('#apVideoPreview video').count() == 1)
    page.click('#apVideoForm button[type=submit]'); page.wait_for_selector('#apVideoMsg.ok')
    pub.reload(wait_until='networkidle'); pub.wait_for_timeout(1200)
    v = pub.locator('#saudi-ai video')
    check('video: section appears once published', pub.locator('#saudi-ai').is_visible() and v.count() == 1)
    check('video: controls, no autoplay, lazy loading, captions', v.get_attribute('controls') is not None and v.get_attribute('autoplay') is None and v.get_attribute('preload') == 'none' and pub.locator('#saudi-ai track[kind="captions"]').count() == 1 and pub.evaluate("document.querySelector('#saudi-ai video').paused"))
    pub.locator('#saudi-ai').scroll_into_view_if_needed(); pub.wait_for_timeout(300); pub.evaluate("document.querySelectorAll('.reveal').forEach(e=>e.classList.add('in'))")
    pub.screenshot(path=f'{SHOTS}/after-video-section.png')
    pub.evaluate("document.querySelector('#saudi-ai video').play()"); pub.wait_for_timeout(1200)
    check('video: plays when the visitor presses play', pub.evaluate("document.querySelector('#saudi-ai video').currentTime") > 0)
    sql("update site_docs set data='{\"status\":\"hidden\"}' where path='site/video'")

    # library admin
    page.click('#t-overview'); page.click('#apRefreshNow')
    page.wait_for_selector('#apRefreshMsg.ok, #apRefreshMsg.err', timeout=60000)
    check('admin: «تحديث الآن» runs the job', 'اكتمل التحديث' in page.inner_text('#apRefreshMsg') or 'انتهى التحديث' in page.inner_text('#apRefreshMsg'), page.inner_text('#apRefreshMsg'))
    page.click('#t-library'); page.click('#apLibSub button[data-f="runs"]'); page.wait_for_selector('.ap-tbl')
    check('admin: run log lists the manual run with its errors', 'يدوي' in page.inner_text('.ap-tbl') and page.locator('.ap-tbl details').count() >= 1)
    shot(page, 'after-admin-runs')
    page.click('#apLibSub button[data-f="sources"]'); page.wait_for_selector('#list-library_sources .ap-row')
    page.locator('#list-library_sources .ap-row', has_text='MIT News').locator('[data-edit]').click()
    page.wait_for_selector('#apDialog[open]'); page.uncheck('#fld-enabled'); page.click('#apDlgSave'); page.wait_for_selector('#apDialog:not([open])', state='attached')
    check('admin: source can be disabled', sql("select enabled from library_sources where name like 'MIT%'") == 'f')
    sql("update library_sources set enabled=true where name like 'MIT%'")
    page.click('#apLibSub button[data-f="items"]'); page.wait_for_selector('#list-library_items .ap-row')
    page.locator('#list-library_items .ap-row').first.locator('[data-edit]').click(); page.wait_for_selector('#apDialog[open]')
    page.select_option('#fld-status', 'hidden'); page.click('#apDlgSave'); page.wait_for_selector('#apDialog:not([open])', state='attached')
    check('admin: library item can be hidden', sql("select count(*) from library_items where status='hidden'") == '1')
    sql("update library_items set status='published'")

    # chatbot knowledge
    page.click('#t-assistant'); page.wait_for_selector('#list-chatbot_knowledge .ap-row')
    check('admin: approved chatbot knowledge listed (10)', page.locator('#list-chatbot_knowledge .ap-row').count() == 10)

    # original in-page editors now save to the database
    page.goto(BASE + '/#admin', wait_until='networkidle'); page.wait_for_selector('#admBody:not([hidden])', timeout=10000)
    page.wait_for_selector('#admCount:not([disabled])', timeout=10000)
    page.fill('#admCount', '88'); page.click('#admSaveSurvey'); page.wait_for_selector('#admMsgSurvey.ok', timeout=10000)
    check('old panel: survey count saved to the database', '"count": 88' in sql("select data::text from site_docs where path='site/config'"))
    shot(page, 'after-old-admin-panel')
    page.goto(BASE + '/#heroes', wait_until='networkidle'); page.wait_for_timeout(1500)
    page.evaluate("location.hash=''")
    check('heroes: editor available to the admin', page.locator('#editHeroes.on').count() == 1)
    page.click('#editHeroes'); page.fill('#hn0', 'بطل اختبار'); page.fill('#hp0', '95'); page.click('#hmSave'); page.wait_for_timeout(1500)
    pub2 = browser.new_context(**desk).new_page(); pub2.goto(BASE + '/', wait_until='networkidle'); pub2.wait_for_timeout(1500)
    pub2.evaluate("document.querySelectorAll('#rounds button').forEach(b=>{ if(b.classList.contains('has')) b.click() })"); pub2.wait_for_timeout(300)
    check('heroes: saved round is visible to visitors', 'بطل اختبار' in pub2.inner_text('#heroBoard'))
    check('survey: new count visible to visitors', pub2.get_attribute('#pulseCount', 'data-count') == '88')
    sql("delete from site_docs where path like 'heroes/%' or path='site/config'")
    ctx.close()

    # admin on a phone
    ctx = browser.new_context(**mob); page = ctx.new_page(); watch(page, 'admin-mobile')
    login(page, ADMIN); page.wait_for_selector('#apApp:not([hidden])'); page.wait_for_timeout(800)
    check('admin mobile: no horizontal scroll', page.evaluate("document.documentElement.scrollWidth") <= 390)
    shot(page, 'after-admin-mobile')
    ctx.close()

    browser.close()

# the wrong-password step makes auth answer 400 on purpose (real Supabase does the same)
console['admin-anon'] = [e for e in console.get('admin-anon', []) if 'status of 400' not in e]
errs = {k: v for k, v in console.items() if v}
check('no console errors (fonts excluded: blocked in this sandbox)', not errs, json.dumps(errs, ensure_ascii=False)[:600])
passed = sum(1 for _, ok, _ in results if ok)
print(f'\n{passed}/{len(results)} checks passed')
json.dump([{'check': n, 'ok': ok, 'detail': d} for n, ok, d in results], open(f'{SHOTS}/results.json', 'w'), ensure_ascii=False, indent=1)
sys.exit(0 if passed == len(results) else 1)
